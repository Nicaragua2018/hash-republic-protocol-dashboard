"""Pruebas del filtro de datos personales."""

import unittest

from privacidad import filtrar


class FiltroTest(unittest.TestCase):
    def test_correo(self):
        self.assertEqual(filtrar("escríbeme a ana.lopez+x@ejemplo.org.ni ya"), "escríbeme a [correo] ya")

    def test_telefonos(self):
        for tel in ["+505 8888 1234", "8888-1234", "(505) 2222-3333", "88881234", "+50588881234"]:
            with self.subTest(tel=tel):
                self.assertEqual(filtrar(f"llámame al {tel}"), "llámame al [teléfono]")

    def test_cedula_con_y_sin_guiones(self):
        self.assertEqual(filtrar("mi cédula es 001-010190-0001A"), "mi cédula es [documento]")
        self.assertEqual(filtrar("cédula 0010101900001a"), "cédula [documento]")

    def test_tarjeta(self):
        self.assertEqual(filtrar("tarjeta 4111 1111 1111 1111"), "tarjeta [tarjeta]")
        self.assertEqual(filtrar("tarjeta 4111-1111-1111-1111"), "tarjeta [tarjeta]")

    def test_no_toca_fechas_ni_cifras(self):
        for texto in [
            "el 2026-10-14",
            "el 15/01/2027",
            "hasta 1,30x",
            "US$10 al mes",
            "versión 0.5",
            "los 25 principios",
            "año 2027",
            "1.000.000 personas",
            "precio 1000000 USD",
            "Bitcoin tiene 21000000 unidades",
            "entre 2025 2026 2027 y 2028",
            "el 2026-10-16 10 personas",
            "del 2026-10-15 2026-10-16 al 2026-10-17",
        ]:
            with self.subTest(texto=texto):
                self.assertEqual(filtrar(texto), texto)

    def test_telefonos_junto_a_fechas_siguen_ocultos(self):
        self.assertEqual(filtrar("el 2026-10-16 llamé al 8888-1234"), "el 2026-10-16 llamé al [teléfono]")

    def test_caracteres_de_uso_privado_no_rompen_el_filtro(self):
        self.assertEqual(filtrar("hola  2026-10-16"), "hola  2026-10-16")

    def test_varios_datos_en_un_texto(self):
        self.assertEqual(filtrar("ana@x.org o +505 8888 1234"), "[correo] o [teléfono]")

    def test_texto_sin_datos_queda_igual(self):
        texto = "¿Qué es OpenCivic? Quiero participar."
        self.assertEqual(filtrar(texto), texto)


if __name__ == "__main__":
    unittest.main()
