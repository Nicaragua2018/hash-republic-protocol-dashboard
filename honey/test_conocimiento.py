"""Pruebas de la base de conocimiento."""

import tempfile
import unittest
from pathlib import Path
from unittest import mock

import conocimiento

CABECERA = "---\ntitulo: {t}\nurl: {u}\nversion: 2026-10-14\n---\n"


class Carpeta(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def escribir(self, nombre, contenido):
        (self.dir / nombre).write_bytes(contenido.encode("utf-8"))
        return self.dir / nombre


class LeerTest(Carpeta):
    def test_lee_cabecera_y_texto(self):
        ruta = self.escribir("a.md", CABECERA.format(t="Licencias", u="/") + "Texto.\n")
        d = conocimiento.leer(ruta)
        self.assertEqual((d.titulo, d.url, d.version, d.texto), ("Licencias", "/", "2026-10-14", "Texto."))

    def test_acepta_finales_de_linea_de_windows(self):
        ruta = self.escribir("a.md", (CABECERA.format(t="X", u="/") + "Texto.\n").replace("\n", "\r\n"))
        self.assertEqual(conocimiento.leer(ruta).texto, "Texto.")

    def test_rechaza_sin_cabecera(self):
        ruta = self.escribir("a.md", "Texto sin cabecera")
        with self.assertRaisesRegex(ValueError, "a.md: falta la cabecera"):
            conocimiento.leer(ruta)

    def test_rechaza_cabecera_incompleta(self):
        ruta = self.escribir("a.md", "---\ntitulo: X\n---\nTexto")
        with self.assertRaisesRegex(ValueError, "faltan url, version"):
            conocimiento.leer(ruta)

    def test_rechaza_url_fuera_del_sitio(self):
        for url in ["https://otro.org", "//otro.org", "sobre"]:
            with self.subTest(url=url):
                ruta = self.escribir("a.md", CABECERA.format(t="X", u=url) + "Texto")
                with self.assertRaisesRegex(ValueError, "ruta del sitio"):
                    conocimiento.leer(ruta)

    def test_rechaza_texto_vacio(self):
        ruta = self.escribir("a.md", CABECERA.format(t="X", u="/") + "\n\n")
        with self.assertRaisesRegex(ValueError, "no tiene texto"):
            conocimiento.leer(ruta)


class CargarTest(Carpeta):
    def test_orden_por_nombre_de_archivo(self):
        self.escribir("b.md", CABECERA.format(t="B", u="/") + "Dos")
        self.escribir("a.md", CABECERA.format(t="A", u="/") + "Uno")
        self.assertEqual([d.titulo for d in conocimiento.cargar(self.dir)], ["A", "B"])

    def test_rechaza_carpeta_vacia(self):
        with self.assertRaisesRegex(ValueError, "vacía"):
            conocimiento.cargar(self.dir)

    def test_rechaza_titulos_repetidos(self):
        self.escribir("a.md", CABECERA.format(t="Igual", u="/") + "Uno")
        self.escribir("b.md", CABECERA.format(t="Igual", u="/") + "Dos")
        with self.assertRaisesRegex(ValueError, "título repetido"):
            conocimiento.cargar(self.dir)

    def test_rechaza_base_demasiado_grande(self):
        self.escribir("a.md", CABECERA.format(t="A", u="/") + "x" * 100)
        with mock.patch.object(conocimiento, "LIMITE_TOKENS", 10):
            with self.assertRaisesRegex(ValueError, "demasiado grande"):
                conocimiento.cargar(self.dir)


class BaseRealTest(unittest.TestCase):
    def test_la_base_del_repositorio_carga(self):
        docs = conocimiento.cargar(Path(__file__).with_name("base"))
        self.assertEqual(
            [d.titulo for d in docs],
            [
                "Licencias de OpenCivic",
                "Quién está detrás de OpenCivic",
                "Guía del sitio de OpenCivic",
                "Proyectos de OpenCivic",
                "Razón de ser de OpenCivic Solutions",
            ],
        )
        self.assertLess(conocimiento.estimar_tokens(docs), 30_000)

    def test_la_base_no_menciona_temas_retirados(self):
        for d in conocimiento.cargar(Path(__file__).with_name("base")):
            for retirado in ["observatorio", "HAD Foundation", "BitCuant", "Hash Republic"]:
                with self.subTest(doc=d.titulo, retirado=retirado):
                    self.assertNotIn(retirado.lower(), d.texto.lower())

    def test_licencias_sin_decidim(self):
        # Carlos pidió omitir la comparación con Decidim (15 oct 2026).
        texto = conocimiento.leer(Path(__file__).with_name("base") / "faq-10-licencias.md").texto
        self.assertNotIn("decidim", texto.lower())


if __name__ == "__main__":
    unittest.main()
