"""Proveedores del modelo de HONEY.

Cada proveedor recibe la base al crearse e implementa
responder(historial, pregunta) -> Respuesta. HONEY_MODELO elige cuál:
"anthropic:<modelo>" o "falso:" (pruebas locales, sin API).
"""

import logging
import re
from dataclasses import dataclass, field

import anthropic

from conocimiento import Documento
from prompt import MARCA_SIN_RESPUESTA, SISTEMA

log = logging.getLogger("honey")

TEXTO_NO_DISPONIBLE = (
    "Ahora mismo no puedo responder. Inténtalo más tarde o escribe al equipo desde la página de contacto."
)
TEXTO_RECHAZO = "No puedo ayudarte con eso. Si tienes una pregunta sobre OpenCivic, con gusto la respondo."
TEXTO_SIN_RESPUESTA = "Eso no está en mis documentos. El equipo puede ayudarte desde la página de contacto."


@dataclass
class Respuesta:
    texto: str
    estado: str  # ok | sin_respuesta | no_disponible | rechazada
    fuentes: list[dict] = field(default_factory=list)


def construir_peticion(nombre: str, docs: list[Documento], historial: list[dict], pregunta: str) -> dict:
    bloques = [
        {
            "type": "document",
            "source": {"type": "text", "media_type": "text/plain", "data": d.texto},
            "title": d.titulo,
            "citations": {"enabled": True},
        }
        for d in docs
    ]
    # La base no cambia entre preguntas: el sistema y los documentos forman
    # el prefijo que la caché reutiliza.
    bloques[-1]["cache_control"] = {"type": "ephemeral"}
    turnos = [*historial, {"rol": "usuario", "texto": pregunta}]
    mensajes = []
    for i, turno in enumerate(turnos):
        rol = "user" if turno["rol"] == "usuario" else "assistant"
        contenido = [*bloques, {"type": "text", "text": turno["texto"]}] if i == 0 else turno["texto"]
        mensajes.append({"role": rol, "content": contenido})
    return {
        "model": nombre,
        "max_tokens": 4096,
        "system": SISTEMA,
        "output_config": {"effort": "low"},
        "messages": mensajes,
    }


def _cortar_en_frase(texto: str) -> str:
    finales = list(re.finditer(r"[.!?…](?=\s|$)", texto))
    return texto[: finales[-1].end()] if finales else texto


def _fuente(doc: Documento) -> dict:
    fuente = {"titulo": doc.titulo, "url": doc.url}
    if doc.imagen:
        fuente.update(imagen=doc.imagen, imagen_alt=doc.imagen_alt)
    return fuente


def _sin_repetidas(texto: str) -> str:
    """Quita las frases que repiten otra anterior de la misma respuesta.

    Con las citas activadas, el modelo a veces copia una frase del documento
    después de haberla dicho (respuesta real del 2026-10-28)."""
    frases = re.split(r"(?<=[.!?…])\s+", texto)
    vistas, quedan = set(), []
    for f in frases:
        clave = " ".join(f.lower().split())
        if clave in vistas:
            continue
        vistas.add(clave)
        quedan.append(f)
    return texto if len(quedan) == len(frases) else " ".join(quedan)


def interpretar(mensaje, docs: list[Documento]) -> Respuesta:
    if mensaje.stop_reason == "refusal":
        return Respuesta(TEXTO_RECHAZO, "rechazada")
    partes, indices = [], []
    for bloque in mensaje.content:
        if bloque.type != "text":
            continue
        partes.append(bloque.text)
        for cita in getattr(bloque, "citations", None) or []:
            i = getattr(cita, "document_index", None)
            if isinstance(i, int) and 0 <= i < len(docs) and i not in indices:
                indices.append(i)
    texto = "".join(partes).strip()
    if mensaje.stop_reason == "max_tokens":
        texto = _cortar_en_frase(texto)
    if not texto or texto.startswith(MARCA_SIN_RESPUESTA):
        texto = texto.removeprefix(MARCA_SIN_RESPUESTA).strip() or TEXTO_SIN_RESPUESTA
        return Respuesta(texto, "sin_respuesta")
    texto = _sin_repetidas(texto.replace(MARCA_SIN_RESPUESTA, "").strip())
    return Respuesta(texto, "ok", [_fuente(docs[i]) for i in indices])


class ModeloAnthropic:
    def __init__(self, nombre: str, docs: list[Documento], cliente=None):
        self.nombre = nombre
        self.docs = docs
        # Lee ANTHROPIC_API_KEY del entorno. Dos reintentos (los del SDK) y
        # 30 s por intento: el visitante no espera más de ~90 s en el peor caso.
        self.cliente = cliente or anthropic.Anthropic(timeout=30.0, max_retries=2)

    def responder(self, historial: list[dict], pregunta: str) -> Respuesta:
        peticion = construir_peticion(self.nombre, self.docs, historial, pregunta)
        try:
            mensaje = self.cliente.messages.create(**peticion)
        except anthropic.RateLimitError:
            log.warning("la API limitó la petición (429)")
            return Respuesta(TEXTO_NO_DISPONIBLE, "no_disponible")
        except anthropic.APIStatusError as e:
            # El mensaje de la API explica el motivo (clave sin espacio de
            # trabajo, sin saldo…); no trae la clave ni datos del visitante.
            log.error(
                "la API respondió %s (petición %s): %s",
                e.status_code,
                e.response.headers.get("request-id"),
                str(getattr(e, "message", ""))[:300],
            )
            return Respuesta(TEXTO_NO_DISPONIBLE, "no_disponible")
        except anthropic.APIConnectionError:
            log.error("no se pudo conectar con la API (o se agotó el tiempo)")
            return Respuesta(TEXTO_NO_DISPONIBLE, "no_disponible")
        uso = mensaje.usage
        log.info(
            "tokens: entrada %s, caché leída %s, caché escrita %s, salida %s",
            uso.input_tokens,
            getattr(uso, "cache_read_input_tokens", 0),
            getattr(uso, "cache_creation_input_tokens", 0),
            uso.output_tokens,
        )
        return interpretar(mensaje, self.docs)


class ModeloFalso:
    """Para pruebas locales y la vista previa: no llama a ninguna API."""

    def __init__(self, docs: list[Documento]):
        self.docs = docs

    def responder(self, historial: list[dict], pregunta: str) -> Respuesta:
        if "sin respuesta" in pregunta.lower():
            return Respuesta(TEXTO_SIN_RESPUESTA, "sin_respuesta")
        d = self.docs[0]
        return Respuesta(f"Respuesta de prueba a: {pregunta}", "ok", [{"titulo": d.titulo, "url": d.url}])


def crear_modelo(especificacion: str, docs: list[Documento], cliente=None):
    proveedor, _, nombre = especificacion.partition(":")
    if proveedor == "anthropic" and nombre:
        return ModeloAnthropic(nombre, docs, cliente)
    if proveedor == "falso":
        return ModeloFalso(docs)
    raise ValueError(f"HONEY_MODELO no reconocido: {especificacion!r} (usa anthropic:<modelo> o falso:)")
