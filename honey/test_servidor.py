"""Pruebas del servidor de HONEY, con un modelo falso."""

import json
import socket
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest import mock

import modelo
import servidor
from limite import LimiteDiario
from modelo import Respuesta
from registro import Registro

RESPUESTA = Respuesta("Código AGPL.", "ok", [{"titulo": "Licencias de OpenCivic", "url": "/"}])


class ModeloGrabador:
    def __init__(self, respuesta=RESPUESTA):
        self.llamadas = []
        self.respuesta = respuesta

    def responder(self, historial, pregunta):
        self.llamadas.append((historial, pregunta))
        return self.respuesta


class ModeloRoto:
    def responder(self, historial, pregunta):
        raise RuntimeError("objeto inesperado del SDK")


class RegistroRoto(Registro):
    def guardar(self, pregunta, respuesta):
        raise OSError("disco lleno")


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.modelo = ModeloGrabador()

    def tearDown(self):
        self.tmp.cleanup()

    def config(self, modelo=..., limite=100, registro=None):
        return servidor.Config(
            modelo=self.modelo if modelo is ... else modelo,
            limite=LimiteDiario(limite),
            registro=registro or Registro(self.dir),
        )


class ValidarChatTest(unittest.TestCase):
    def test_acepta_pregunta_e_historial_validos(self):
        historial = [{"rol": "usuario", "texto": " hola "}, {"rol": "asistente", "texto": "¡Hola!"}]
        h, p = servidor.validar_chat({"pregunta": "  ¿Licencia?  ", "historial": historial})
        self.assertEqual(p, "¿Licencia?")
        self.assertEqual(h, [{"rol": "usuario", "texto": "hola"}, {"rol": "asistente", "texto": "¡Hola!"}])

    def test_pregunta_de_500_caracteres_vale(self):
        self.assertEqual(servidor.validar_chat({"pregunta": "a" * 500})[1], "a" * 500)

    def test_rechaza_peticiones_invalidas(self):
        for datos in [None, [], {}, {"pregunta": "   "}, {"pregunta": 5}, {"pregunta": "a" * 501}]:
            with self.subTest(datos=str(datos)[:40]):
                with self.assertRaises(servidor.PeticionInvalida):
                    servidor.validar_chat(datos)

    def test_rechaza_historial_mal_formado(self):
        u = {"rol": "usuario", "texto": "x"}
        a = {"rol": "asistente", "texto": "y"}
        for historial in [
            "texto",
            [u],  # termina en el usuario
            [a, u],  # empieza por el asistente
            [u, u],  # dos del usuario seguidos
            [u, a] * 4,  # más de 6 intervenciones
            [u, {"rol": "asistente", "texto": "y" * 1001}],
            [u, {"rol": "asistente", "texto": 3}],
            [u, {"rol": "asistente", "texto": "  "}],
        ]:
            with self.subTest(historial=str(historial)[:60]):
                with self.assertRaises(servidor.PeticionInvalida):
                    servidor.validar_chat({"pregunta": "hola", "historial": historial})


class AtenderChatTest(Base):
    def test_responde_y_registra(self):
        codigo, cuerpo = servidor.atender_chat(self.config(), {"pregunta": "¿Licencia?"})
        self.assertEqual(codigo, 200)
        self.assertEqual(cuerpo["estado"], "ok")
        self.assertEqual(cuerpo["fuentes"], RESPUESTA.fuentes)
        self.assertRegex(cuerpo["id"], r"^r_[0-9a-f]{16}$")
        self.assertEqual(len(list(self.dir.glob("*.jsonl"))), 1)

    def test_filtra_pregunta_e_historial(self):
        historial = [{"rol": "usuario", "texto": "soy ana@x.org"}, {"rol": "asistente", "texto": "Hola."}]
        servidor.atender_chat(self.config(), {"pregunta": "llámame al 8888-1234", "historial": historial})
        (h, p), = self.modelo.llamadas
        self.assertEqual(p, "llámame al [teléfono]")
        self.assertEqual(h[0]["texto"], "soy [correo]")
        registrado = (next(self.dir.glob("*.jsonl"))).read_text(encoding="utf-8")
        self.assertNotIn("8888", registrado)

    def test_apagado_responde_503_sin_llamar_al_modelo(self):
        codigo, cuerpo = servidor.atender_chat(self.config(modelo=None), {"pregunta": "hola"})
        self.assertEqual((codigo, cuerpo["estado"]), (503, "no_disponible"))

    def test_limite_diario(self):
        cfg = self.config(limite=1)
        servidor.atender_chat(cfg, {"pregunta": "uno"})
        codigo, cuerpo = servidor.atender_chat(cfg, {"pregunta": "dos"})
        self.assertEqual((codigo, cuerpo["estado"], cuerpo["texto"]), (200, "no_disponible", servidor.TEXTO_LIMITE))
        self.assertEqual(len(self.modelo.llamadas), 1)

    def test_no_disponible_no_se_registra_ni_se_vota(self):
        self.modelo.respuesta = Respuesta(modelo.TEXTO_NO_DISPONIBLE, "no_disponible")
        codigo, cuerpo = servidor.atender_chat(self.config(), {"pregunta": "hola"})
        self.assertEqual((codigo, cuerpo["estado"], cuerpo["id"]), (200, "no_disponible", None))
        self.assertEqual(list(self.dir.glob("*.jsonl")), [])

    def test_error_inesperado_del_modelo_da_no_disponible(self):
        codigo, cuerpo = servidor.atender_chat(self.config(modelo=ModeloRoto()), {"pregunta": "hola"})
        self.assertEqual((codigo, cuerpo["estado"], cuerpo["id"]), (200, "no_disponible", None))

    def test_tope_de_preguntas_simultaneas(self):
        cfg = self.config(limite=1)
        cfg.simultaneas = threading.BoundedSemaphore(1)
        cfg.simultaneas.acquire()  # otra pregunta ocupa el único lugar
        with mock.patch.object(servidor, "ESPERA_CUPO", 0.05):
            codigo, cuerpo = servidor.atender_chat(cfg, {"pregunta": "hola"})
        self.assertEqual((codigo, cuerpo["estado"], cuerpo["texto"]), (200, "no_disponible", servidor.TEXTO_OCUPADO))
        self.assertEqual(self.modelo.llamadas, [])
        cfg.simultaneas.release()
        # No gastó el cupo diario: la siguiente pregunta sí se responde.
        self.assertEqual(servidor.atender_chat(cfg, {"pregunta": "hola"})[1]["estado"], "ok")

    def test_si_falla_el_registro_igual_responde(self):
        codigo, cuerpo = servidor.atender_chat(self.config(registro=RegistroRoto(self.dir)), {"pregunta": "hola"})
        self.assertEqual((codigo, cuerpo["estado"], cuerpo["id"]), (200, "ok", None))


class AtenderVotoTest(Base):
    def test_voto_valido(self):
        self.assertEqual(servidor.atender_voto(self.config(), {"id": "r_0123456789abcdef", "util": True}), 204)

    def test_voto_invalido(self):
        for datos in [None, {"id": "x", "util": True}, {"id": "r_0123456789abcdef", "util": "sí"}]:
            with self.subTest(datos=datos):
                with self.assertRaises(servidor.PeticionInvalida):
                    servidor.atender_voto(self.config(), datos)

    def test_apagado(self):
        self.assertEqual(servidor.atender_voto(self.config(modelo=None), {"id": "r_0123456789abcdef", "util": True}), 503)


class HttpTest(Base):
    def arrancar(self, cfg):
        srv = servidor.make_server(cfg, 0)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        return f"http://127.0.0.1:{srv.server_address[1]}"

    def pedir(self, url, metodo="GET", cuerpo=None):
        datos = cuerpo if isinstance(cuerpo, (bytes, type(None))) else json.dumps(cuerpo).encode()
        req = urllib.request.Request(url, data=datos, method=metodo, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.status, r.read(), r.headers
        except urllib.error.HTTPError as e:
            return e.code, e.read(), e.headers

    def test_vivo_y_salud(self):
        encendido = self.arrancar(self.config())
        apagado = self.arrancar(self.config(modelo=None))
        self.assertEqual(self.pedir(f"{apagado}/vivo")[0], 200)
        codigo, cuerpo, _ = self.pedir(f"{encendido}/salud")
        self.assertEqual((codigo, json.loads(cuerpo)), (200, {"activo": True}))
        # Apagado responde 200 igual: un 503 llenaría de errores la consola del
        # navegador en cada página. La burbuja mira "activo", no el código.
        codigo, cuerpo, _ = self.pedir(f"{apagado}/salud")
        self.assertEqual((codigo, json.loads(cuerpo)), (200, {"activo": False}))

    def test_chat(self):
        base = self.arrancar(self.config())
        codigo, cuerpo, cabeceras = self.pedir(f"{base}/chat", "POST", {"pregunta": "¿Licencia?"})
        self.assertEqual(codigo, 200)
        self.assertEqual(cabeceras["Content-Type"], "application/json; charset=utf-8")
        self.assertEqual(cabeceras["Cache-Control"], "no-store")
        self.assertEqual(json.loads(cuerpo)["texto"], "Código AGPL.")

    def test_errores_de_peticion(self):
        base = self.arrancar(self.config())
        self.assertEqual(self.pedir(f"{base}/chat", "POST", b"{no es json")[0], 400)
        self.assertEqual(self.pedir(f"{base}/chat", "POST", {"pregunta": ""})[0], 400)
        self.assertEqual(self.pedir(f"{base}/chat", "POST", b"x" * 9000)[0], 413)
        self.assertEqual(self.pedir(f"{base}/otra")[0], 404)
        self.assertEqual(self.pedir(f"{base}/chat")[0], 404)

    def test_cierra_conexiones_lentas(self):
        srv = servidor.make_server(self.config(), 0, tiempo_lectura=0.5)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        with socket.create_connection(("127.0.0.1", srv.server_address[1]), timeout=5) as s:
            s.sendall(b"POST /chat HTTP/1.1\r\n")  # y nunca termina la petición
            self.assertEqual(s.recv(1024), b"")  # el servidor cierra antes de 5 s

    def test_voto(self):
        base = self.arrancar(self.config())
        self.assertEqual(self.pedir(f"{base}/util", "POST", {"id": "r_0123456789abcdef", "util": True})[0], 204)
        self.assertEqual(self.pedir(f"{base}/util", "POST", {"id": "nada", "util": True})[0], 400)


class CrearConfigTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.entorno = {"HONEY_REGISTROS": self.tmp.name}

    def tearDown(self):
        self.tmp.cleanup()

    def test_apagado_por_defecto(self):
        self.assertFalse(servidor.crear_config(self.entorno).activo)

    def test_modelo_falso(self):
        cfg = servidor.crear_config({**self.entorno, "HONEY_ACTIVO": "1", "HONEY_MODELO": "falso:"})
        self.assertIsInstance(cfg.modelo, modelo.ModeloFalso)

    def test_sin_clave_queda_apagado(self):
        with mock.patch.dict("os.environ", {}, clear=True):
            cfg = servidor.crear_config({**self.entorno, "HONEY_ACTIVO": "1"})
        self.assertFalse(cfg.activo)

    def test_con_clave_usa_anthropic_y_el_limite(self):
        entorno = {**self.entorno, "HONEY_ACTIVO": "1", "ANTHROPIC_API_KEY": "sk-prueba", "HONEY_LIMITE_DIARIO": "7"}
        with mock.patch.dict("os.environ", {"ANTHROPIC_API_KEY": "sk-prueba"}):
            cfg = servidor.crear_config(entorno)
        self.assertIsInstance(cfg.modelo, modelo.ModeloAnthropic)
        self.assertEqual(cfg.modelo.nombre, "claude-haiku-5-5")
        self.assertEqual(cfg.limite.limite, 7)


if __name__ == "__main__":
    unittest.main()
