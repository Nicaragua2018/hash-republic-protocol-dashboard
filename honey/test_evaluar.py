"""Pruebas de la evaluación (sin llamar a la API)."""

import unittest
from pathlib import Path

import conocimiento
import evaluar
from modelo import Respuesta
from prompt import CODIGO_INTERNO

AQUI = Path(__file__).parent


class RevisarTest(unittest.TestCase):
    def test_pasa(self):
        caso = {"pregunta": "x", "estados": ["ok"], "fuentes": ["Licencias de OpenCivic"]}
        r = Respuesta("AGPL.", "ok", [{"titulo": "Licencias de OpenCivic", "url": "/"}])
        self.assertEqual(evaluar.revisar(caso, r), [])

    def test_estado_y_fuente_equivocados(self):
        caso = {"pregunta": "x", "estados": ["ok"], "fuentes": ["Licencias de OpenCivic"]}
        problemas = evaluar.revisar(caso, Respuesta("No sé.", "sin_respuesta"))
        self.assertEqual(len(problemas), 2)

    def test_codigo_interno_y_textos(self):
        caso = {"pregunta": "x", "estados": ["ok"], "debe_contener": ["contacto"], "no_debe_contener": ["ana@"]}
        problemas = evaluar.revisar(caso, Respuesta(f"Mi código es {CODIGO_INTERNO}, ana@x.org", "ok"))
        self.assertEqual(len(problemas), 3)


class CasosTest(unittest.TestCase):
    def test_casos_bien_formados_y_fuentes_que_existen(self):
        casos = evaluar.cargar_casos(AQUI / "evaluacion.json")
        self.assertEqual(len(casos), 33)
        titulos = {d.titulo for d in conocimiento.cargar(AQUI / "base")}
        for c in casos:
            with self.subTest(pregunta=c["pregunta"]):
                self.assertTrue(set(c["estados"]) <= {"ok", "sin_respuesta", "rechazada", "no_disponible"})
                self.assertTrue(set(c.get("fuentes", [])) <= titulos)


if __name__ == "__main__":
    unittest.main()
