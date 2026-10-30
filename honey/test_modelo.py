"""Pruebas del proveedor del modelo. No llaman a ninguna API."""

import unittest
from types import SimpleNamespace as NS

import anthropic

import modelo
from conocimiento import Documento
from prompt import CODIGO_INTERNO, MARCA_SIN_RESPUESTA, SISTEMA

DOCS = [
    Documento("Razón de ser", "/sobre", "v1", "OpenCivic busca el bien común."),
    Documento("Licencias de OpenCivic", "/", "v1", "Código AGPL-3.0-or-later."),
]


def texto(t, *indices):
    citas = [NS(type="char_location", document_index=i, cited_text="x") for i in indices]
    return NS(type="text", text=t, citations=citas or None)


def mensaje(*bloques, stop="end_turn"):
    uso = NS(input_tokens=10, output_tokens=5, cache_read_input_tokens=0, cache_creation_input_tokens=0)
    return NS(content=list(bloques), stop_reason=stop, usage=uso)


class ClienteFalso:
    def __init__(self, respuesta=None, error=None):
        self.peticiones = []
        self.respuesta = respuesta
        self.error = error
        self.messages = self

    def create(self, **peticion):
        self.peticiones.append(peticion)
        if self.error:
            raise self.error
        return self.respuesta


def error_api(cls, status=500, mensaje="error de prueba"):
    # Sin __init__: basta para probar a qué except llega cada error.
    e = Exception.__new__(cls)
    e.status_code = status
    e.message = mensaje
    e.response = NS(headers={"request-id": "req_prueba"})
    return e


class PromptTest(unittest.TestCase):
    def test_el_prompt_pide_la_marca_y_trae_el_codigo_interno(self):
        self.assertIn(MARCA_SIN_RESPUESTA, SISTEMA)
        self.assertIn(CODIGO_INTERNO, SISTEMA)
        self.assertIn("el asistente", SISTEMA)

    def test_ante_politica_no_resume_posturas(self):
        # Evaluación del 2026-10-28, pregunta 24: al pedirle opinión sobre el
        # gobierno, citaba la crítica de la razón de ser a libertarios y
        # socialistas. Ante política solo dice que no opina.
        self.assertIn("no resumes posturas políticas", SISTEMA)


class PeticionTest(unittest.TestCase):
    def test_base_con_citas_y_cache_en_el_ultimo_documento(self):
        p = modelo.construir_peticion("claude-haiku-5-5", DOCS, [], "¿Qué licencia?")
        self.assertEqual(p["model"], "claude-haiku-5-5")
        self.assertEqual(p["max_tokens"], 4096)
        self.assertEqual(p["output_config"], {"effort": "low"})
        self.assertEqual(p["system"], SISTEMA)
        self.assertNotIn("thinking", p)
        self.assertNotIn("temperature", p)
        (unico,) = p["messages"]
        self.assertEqual(unico["role"], "user")
        docs, pregunta = unico["content"][:-1], unico["content"][-1]
        self.assertEqual([d["title"] for d in docs], ["Razón de ser", "Licencias de OpenCivic"])
        for d in docs:
            self.assertEqual(d["type"], "document")
            self.assertEqual(d["source"], {"type": "text", "media_type": "text/plain", "data": d["source"]["data"]})
            self.assertEqual(d["citations"], {"enabled": True})
        self.assertNotIn("cache_control", docs[0])
        self.assertEqual(docs[-1]["cache_control"], {"type": "ephemeral"})
        self.assertEqual(pregunta, {"type": "text", "text": "¿Qué licencia?"})

    def test_prefijo_identico_entre_preguntas(self):
        a = modelo.construir_peticion("m", DOCS, [], "uno")
        b = modelo.construir_peticion("m", DOCS, [], "dos")
        self.assertEqual(a["system"], b["system"])
        self.assertEqual(a["messages"][0]["content"][:-1], b["messages"][0]["content"][:-1])

    def test_historial_alterna_roles(self):
        historial = [{"rol": "usuario", "texto": "hola"}, {"rol": "asistente", "texto": "¡Hola!"}]
        p = modelo.construir_peticion("m", DOCS, historial, "¿y la licencia?")
        self.assertEqual([m["role"] for m in p["messages"]], ["user", "assistant", "user"])
        self.assertEqual(p["messages"][0]["content"][-1], {"type": "text", "text": "hola"})
        self.assertEqual(p["messages"][1]["content"], "¡Hola!")
        self.assertEqual(p["messages"][2]["content"], "¿y la licencia?")


class InterpretarTest(unittest.TestCase):
    def test_quita_frases_repetidas(self):
        # Respuesta real del 2026-10-28: el modelo repitió una frase citada.
        r = modelo.interpretar(
            mensaje(
                texto("Se publica un artículo nuevo cada lunes.", 0),
                texto(" Se publica un artículo nuevo cada lunes.", 0),
                texto(" El correo es info@opencivicsolutions.org. ¿Algo más?"),
            ),
            DOCS,
        )
        self.assertEqual(
            r.texto, "Se publica un artículo nuevo cada lunes. El correo es info@opencivicsolutions.org. ¿Algo más?"
        )

    def test_texto_y_fuentes_en_orden_de_aparicion(self):
        r = modelo.interpretar(
            mensaje(texto("El código usa "), texto("AGPL", 1), texto(" y busca el bien común.", 0, 1)), DOCS
        )
        self.assertEqual(r.estado, "ok")
        self.assertEqual(r.texto, "El código usa AGPL y busca el bien común.")
        self.assertEqual(
            r.fuentes,
            [{"titulo": "Licencias de OpenCivic", "url": "/"}, {"titulo": "Razón de ser", "url": "/sobre"}],
        )

    def test_la_fuente_lleva_su_imagen(self):
        docs = [Documento("Quién está detrás", "/sobre", "v1", "Carlos.", "/c.webp", "Avatar de Carlos generado con IA")]
        r = modelo.interpretar(mensaje(texto("Lo dirige Carlos.", 0)), docs)
        self.assertEqual(
            r.fuentes,
            [
                {
                    "titulo": "Quién está detrás",
                    "url": "/sobre",
                    "imagen": "/c.webp",
                    "imagen_alt": "Avatar de Carlos generado con IA",
                }
            ],
        )

    def test_ignora_bloques_que_no_son_texto(self):
        r = modelo.interpretar(mensaje(NS(type="thinking", thinking=""), texto("Hola.", 0)), DOCS)
        self.assertEqual(r.texto, "Hola.")

    def test_marca_sin_respuesta(self):
        r = modelo.interpretar(mensaje(texto(f"{MARCA_SIN_RESPUESTA} Eso no está en mis documentos.")), DOCS)
        self.assertEqual((r.estado, r.texto, r.fuentes), ("sin_respuesta", "Eso no está en mis documentos.", []))

    def test_texto_vacio_es_sin_respuesta(self):
        r = modelo.interpretar(mensaje(), DOCS)
        self.assertEqual((r.estado, r.texto), ("sin_respuesta", modelo.TEXTO_SIN_RESPUESTA))

    def test_rechazo(self):
        r = modelo.interpretar(mensaje(texto("..."), stop="refusal"), DOCS)
        self.assertEqual((r.estado, r.texto), ("rechazada", modelo.TEXTO_RECHAZO))

    def test_max_tokens_corta_en_la_ultima_frase(self):
        r = modelo.interpretar(mensaje(texto("Primera frase. Segunda sin termi", 0), stop="max_tokens"), DOCS)
        self.assertEqual(r.texto, "Primera frase.")

    def test_indice_fuera_de_rango(self):
        r = modelo.interpretar(mensaje(texto("Algo.", 7, -1)), DOCS)
        self.assertEqual((r.estado, r.fuentes), ("ok", []))


class ResponderTest(unittest.TestCase):
    def test_usa_el_cliente_y_devuelve_la_respuesta(self):
        cliente = ClienteFalso(respuesta=mensaje(texto("AGPL.", 1)))
        r = modelo.ModeloAnthropic("claude-haiku-5-5", DOCS, cliente).responder([], "¿Licencia?")
        self.assertEqual(r.estado, "ok")
        self.assertEqual(cliente.peticiones[0]["model"], "claude-haiku-5-5")

    def test_errores_de_la_api_dan_no_disponible(self):
        for err in [
            error_api(anthropic.RateLimitError, 429),
            error_api(anthropic.AuthenticationError, 401),
            error_api(anthropic.APIStatusError, 500),
            error_api(anthropic.APIConnectionError),
            error_api(anthropic.APITimeoutError),
        ]:
            with self.subTest(error=type(err).__name__):
                m = modelo.ModeloAnthropic("m", DOCS, ClienteFalso(error=err))
                r = m.responder([], "hola")
                self.assertEqual((r.estado, r.texto), ("no_disponible", modelo.TEXTO_NO_DISPONIBLE))

    def test_el_registro_guarda_el_motivo_del_error(self):
        # El 2026-10-28 la clave sin espacio de trabajo daba 400 y el registro
        # solo decía «400»: el motivo estaba en el mensaje de la API.
        err = error_api(anthropic.BadRequestError, 400, "This API key is not scoped to a workspace")
        m = modelo.ModeloAnthropic("m", DOCS, ClienteFalso(error=err))
        with self.assertLogs(modelo.log, "ERROR") as registro:
            m.responder([], "hola")
        self.assertIn("not scoped to a workspace", registro.output[0])


class CrearModeloTest(unittest.TestCase):
    def test_anthropic(self):
        m = modelo.crear_modelo("anthropic:claude-haiku-5-5", DOCS, cliente=ClienteFalso())
        self.assertIsInstance(m, modelo.ModeloAnthropic)
        self.assertEqual(m.nombre, "claude-haiku-5-5")

    def test_falso(self):
        m = modelo.crear_modelo("falso:", DOCS)
        self.assertEqual(m.responder([], "hola").fuentes, [{"titulo": "Razón de ser", "url": "/sobre"}])
        self.assertEqual(m.responder([], "esto no tiene sin respuesta").estado, "sin_respuesta")

    def test_especificaciones_invalidas(self):
        for esp in ["local:llama", "anthropic:", "", "haiku"]:
            with self.subTest(esp=esp):
                with self.assertRaisesRegex(ValueError, "HONEY_MODELO"):
                    modelo.crear_modelo(esp, DOCS)


if __name__ == "__main__":
    unittest.main()
