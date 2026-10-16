"""Pruebas del límite diario y de los registros."""

import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from limite import MANAGUA, LimiteDiario
from modelo import Respuesta
from registro import Registro


class Reloj:
    def __init__(self, ahora):
        self.ahora = ahora

    def __call__(self):
        return self.ahora


class LimiteDiarioTest(unittest.TestCase):
    def test_limite_por_dia(self):
        reloj = Reloj(datetime(2026, 10, 14, 23, 0, tzinfo=MANAGUA))
        lim = LimiteDiario(2, reloj)
        self.assertTrue(lim.tomar())
        self.assertTrue(lim.tomar())
        self.assertFalse(lim.tomar())
        reloj.ahora = datetime(2026, 10, 15, 0, 1, tzinfo=MANAGUA)
        self.assertTrue(lim.tomar())

    def test_el_dia_cambia_a_medianoche_de_managua(self):
        reloj = Reloj(datetime(2026, 10, 14, 12, 0, tzinfo=timezone.utc))
        lim = LimiteDiario(1, reloj)
        self.assertTrue(lim.tomar())
        reloj.ahora = datetime(2026, 10, 15, 5, 0, tzinfo=timezone.utc)  # 23:00 del 14 en Managua
        self.assertFalse(lim.tomar())
        reloj.ahora = datetime(2026, 10, 15, 6, 0, tzinfo=timezone.utc)  # 00:00 del 15 en Managua
        self.assertTrue(lim.tomar())


class RegistroTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.reloj = Reloj(datetime(2026, 10, 14, 10, 0, tzinfo=MANAGUA))
        self.reg = Registro(self.dir, self.reloj)

    def tearDown(self):
        self.tmp.cleanup()

    def lineas(self, nombre="2026-10-14.jsonl"):
        return [json.loads(x) for x in (self.dir / nombre).read_text(encoding="utf-8").splitlines()]

    def test_guardar_escribe_una_linea_sin_ip_ni_identidad(self):
        rid = self.reg.guardar("¿Qué licencia?", Respuesta("AGPL.", "ok", [{"titulo": "Licencias", "url": "/"}]))
        self.assertRegex(rid, r"^r_[0-9a-f]{16}$")
        (linea,) = self.lineas()
        self.assertEqual(set(linea), {"id", "fecha", "tipo", "pregunta", "texto", "estado", "fuentes"})
        self.assertEqual(linea["tipo"], "respuesta")
        self.assertEqual(linea["pregunta"], "¿Qué licencia?")
        self.assertEqual(linea["fuentes"], ["Licencias"])
        self.assertEqual(linea["fecha"], "2026-10-14T10:00:00-06:00")

    def test_votar_agrega_una_linea(self):
        rid = self.reg.guardar("hola", Respuesta("Hola.", "ok"))
        self.reg.votar(rid, False)
        voto = self.lineas()[1]
        self.assertEqual((voto["id"], voto["tipo"], voto["util"]), (rid, "voto", False))

    def test_solo_se_vota_una_vez_por_respuesta_real(self):
        rid = self.reg.guardar("hola", Respuesta("Hola.", "ok"))
        self.assertFalse(self.reg.votar("r_0123456789abcdef", True))  # id que nunca se dio
        self.assertTrue(self.reg.votar(rid, True))
        self.assertFalse(self.reg.votar(rid, False))  # segundo voto
        self.assertEqual([x["tipo"] for x in self.lineas()], ["respuesta", "voto"])

    def test_recuerda_solo_las_respuestas_recientes(self):
        reg = Registro(self.dir, self.reloj, recientes=2)
        viejo = reg.guardar("uno", Respuesta("1.", "ok"))
        reg.guardar("dos", Respuesta("2.", "ok"))
        nuevo = reg.guardar("tres", Respuesta("3.", "ok"))
        self.assertFalse(reg.votar(viejo, True))
        self.assertTrue(reg.votar(nuevo, True))

    def test_purgar_borra_lo_de_mas_de_30_dias(self):
        for nombre in ["2026-09-13.jsonl", "2026-09-14.jsonl", "notas.txt", "basura.jsonl"]:
            (self.dir / nombre).write_text("{}\n", encoding="utf-8")
        self.assertEqual(self.reg.purgar(), 1)
        self.assertEqual(
            sorted(p.name for p in self.dir.iterdir()), ["2026-09-14.jsonl", "basura.jsonl", "notas.txt"]
        )


if __name__ == "__main__":
    unittest.main()
