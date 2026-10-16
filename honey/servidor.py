"""Servidor de HONEY: la única entrada pública del asistente.

Traefik quita el prefijo /honey. Rutas: GET /vivo (chequeo de Docker),
GET /salud (¿está encendido?), POST /chat y POST /util. Nunca registra IP:
las líneas de acceso del servidor HTTP están apagadas.
"""

import json
import logging
import os
import re
import threading
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from conocimiento import cargar, estimar_tokens
from limite import LimiteDiario
from modelo import TEXTO_NO_DISPONIBLE, Respuesta, crear_modelo
from privacidad import filtrar
from registro import Registro

MAX_BODY = 8192
MAX_PREGUNTA = 500
MAX_TURNOS = 6
MAX_TURNO = 1000
DIA = 24 * 3600
ID_VALIDO = re.compile(r"r_[0-9a-f]{16}")
TEXTO_LIMITE = (
    "Hoy ya respondí todas las preguntas que puedo. Vuelve mañana o escribe al equipo desde la página de contacto."
)

log = logging.getLogger("honey")


class PeticionInvalida(ValueError):
    pass


class CuerpoDemasiadoGrande(Exception):
    pass


@dataclass
class Config:
    modelo: object  # None = HONEY apagado
    limite: LimiteDiario
    registro: Registro

    @property
    def activo(self) -> bool:
        return self.modelo is not None


def validar_chat(datos) -> tuple[list[dict], str]:
    if not isinstance(datos, dict):
        raise PeticionInvalida("se esperaba un objeto JSON")
    pregunta = datos.get("pregunta")
    if not isinstance(pregunta, str) or not pregunta.strip():
        raise PeticionInvalida("falta la pregunta")
    pregunta = pregunta.strip()
    if len(pregunta) > MAX_PREGUNTA:
        raise PeticionInvalida(f"la pregunta pasa de {MAX_PREGUNTA} caracteres")
    historial = datos.get("historial", [])
    if not isinstance(historial, list) or len(historial) > MAX_TURNOS or len(historial) % 2:
        raise PeticionInvalida("historial inválido")
    limpio = []
    for i, turno in enumerate(historial):
        rol = "usuario" if i % 2 == 0 else "asistente"
        if not isinstance(turno, dict) or turno.get("rol") != rol:
            raise PeticionInvalida("historial inválido")
        texto = turno.get("texto")
        if not isinstance(texto, str) or not texto.strip() or len(texto) > MAX_TURNO:
            raise PeticionInvalida("historial inválido")
        limpio.append({"rol": rol, "texto": texto.strip()})
    return limpio, pregunta


def atender_chat(cfg: Config, datos) -> tuple[int, dict]:
    if not cfg.activo:
        return 503, {"id": None, "texto": TEXTO_NO_DISPONIBLE, "fuentes": [], "estado": "no_disponible"}
    historial, pregunta = validar_chat(datos)
    if not cfg.limite.tomar():
        log.info("límite diario alcanzado")
        return 200, {"id": None, "texto": TEXTO_LIMITE, "fuentes": [], "estado": "no_disponible"}
    pregunta = filtrar(pregunta)
    historial = [{"rol": t["rol"], "texto": filtrar(t["texto"])} for t in historial]
    respuesta: Respuesta = cfg.modelo.responder(historial, pregunta)
    try:
        rid = cfg.registro.guardar(pregunta, respuesta)
    except OSError:
        log.exception("no se pudo guardar el registro")
        rid = None
    log.info("pregunta respondida: %s", respuesta.estado)
    return 200, {"id": rid, "texto": respuesta.texto, "fuentes": respuesta.fuentes, "estado": respuesta.estado}


def atender_voto(cfg: Config, datos) -> int:
    if not cfg.activo:
        return 503
    if (
        not isinstance(datos, dict)
        or not isinstance(datos.get("id"), str)
        or not ID_VALIDO.fullmatch(datos["id"])
        or not isinstance(datos.get("util"), bool)
    ):
        raise PeticionInvalida("voto inválido")
    try:
        cfg.registro.votar(datos["id"], datos["util"])
    except OSError:
        log.exception("no se pudo guardar el voto")
    return 204


def make_server(cfg: Config, port: int = 8080) -> ThreadingHTTPServer:
    class Handler(BaseHTTPRequestHandler):
        server_version = "honey"
        sys_version = ""

        def log_message(self, *args):
            # Las líneas de acceso incluyen la IP: no se registran.
            pass

        def _json(self, code: int, cuerpo: dict | None = None):
            datos = b"" if cuerpo is None else json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            if cuerpo is not None:
                self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(datos)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(datos)

        def _leer_json(self):
            try:
                largo = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                largo = -1
            if largo < 0 or largo > MAX_BODY:
                # Se vacía lo que llegó (hasta 64 KB) para que el cliente lea el 413.
                self.rfile.read(min(max(largo, 0), 65536))
                self.close_connection = True
                raise CuerpoDemasiadoGrande
            crudo = self.rfile.read(largo) if largo else b""
            try:
                return json.loads(crudo.decode("utf-8")) if crudo else None
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                raise PeticionInvalida("el cuerpo no es JSON válido") from e

        def do_GET(self):
            if self.path == "/vivo":
                self._json(200, {"vivo": True})
            elif self.path == "/salud":
                self._json(200 if cfg.activo else 503, {"activo": cfg.activo})
            else:
                self._json(404, {"error": "no existe"})

        def do_POST(self):
            if self.path not in ("/chat", "/util"):
                self._json(404, {"error": "no existe"})
                return
            try:
                datos = self._leer_json()
                if self.path == "/chat":
                    self._json(*atender_chat(cfg, datos))
                else:
                    self._json(atender_voto(cfg, datos))
            except CuerpoDemasiadoGrande:
                self._json(413, {"error": "la petición es demasiado grande"})
            except PeticionInvalida as e:
                self._json(400, {"error": str(e)})

    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    httpd.cfg = cfg
    return httpd


def crear_config(entorno=os.environ) -> Config:
    docs = cargar(Path(__file__).with_name("base"))
    log.info("base cargada: %d documentos, ~%d tokens", len(docs), estimar_tokens(docs))
    modelo = None
    if entorno.get("HONEY_ACTIVO") == "1":
        especificacion = entorno.get("HONEY_MODELO", "anthropic:claude-haiku-5-5")
        if especificacion.startswith("anthropic:") and not entorno.get("ANTHROPIC_API_KEY"):
            log.warning("HONEY_ACTIVO=1 pero falta ANTHROPIC_API_KEY: HONEY queda apagado")
        else:
            modelo = crear_modelo(especificacion, docs)
    log.info("HONEY %s", "encendido" if modelo else "apagado")
    return Config(
        modelo=modelo,
        limite=LimiteDiario(int(entorno.get("HONEY_LIMITE_DIARIO", "300"))),
        registro=Registro(Path(entorno.get("HONEY_REGISTROS", "/registros"))),
    )


def _purgar_cada_dia(registro: Registro) -> None:
    espera = threading.Event()
    while True:
        try:
            borrados = registro.purgar()
            if borrados:
                log.info("registros borrados por antigüedad: %d", borrados)
        except OSError:
            log.exception("no se pudieron borrar registros viejos")
        espera.wait(DIA)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    cfg = crear_config()
    threading.Thread(target=_purgar_cada_dia, args=(cfg.registro,), daemon=True).start()
    httpd = make_server(cfg, int(os.environ.get("PORT", "8080")))
    log.info("honey escuchando")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
