"""Registros de HONEY: un archivo JSONL por día, sin IP ni identidad.

Cada línea es una respuesta (pregunta ya filtrada, texto, estado, títulos de
las fuentes) o un voto de utilidad. Los archivos de más de `dias` días se
borran.
"""

import json
import secrets
import threading
from collections import OrderedDict
from datetime import date, datetime, timedelta
from pathlib import Path

from limite import MANAGUA


class Registro:
    def __init__(self, carpeta: Path, reloj=None, dias: int = 30, recientes: int = 2000):
        self.carpeta = Path(carpeta)
        self.dias = dias
        self._reloj = reloj or (lambda: datetime.now(MANAGUA))
        self._lock = threading.Lock()
        # Respuestas que todavía se pueden votar (una vez cada una). Vive en
        # memoria: tras un reinicio, las respuestas anteriores ya no se votan.
        self._recientes = recientes
        self._votables: OrderedDict[str, None] = OrderedDict()
        self._lock_votos = threading.Lock()

    def _ahora(self) -> datetime:
        return self._reloj().astimezone(MANAGUA)

    def _escribir(self, ahora: datetime, linea: dict) -> None:
        ruta = self.carpeta / f"{ahora.date().isoformat()}.jsonl"
        with self._lock, ruta.open("a", encoding="utf-8") as f:
            f.write(json.dumps(linea, ensure_ascii=False) + "\n")

    def guardar(self, pregunta: str, respuesta) -> str:
        rid = "r_" + secrets.token_hex(8)
        ahora = self._ahora()
        self._escribir(
            ahora,
            {
                "id": rid,
                "fecha": ahora.isoformat(timespec="seconds"),
                "tipo": "respuesta",
                "pregunta": pregunta,
                "texto": respuesta.texto,
                "estado": respuesta.estado,
                "fuentes": [f["titulo"] for f in respuesta.fuentes],
            },
        )
        with self._lock_votos:
            self._votables[rid] = None
            while len(self._votables) > self._recientes:
                self._votables.popitem(last=False)
        return rid

    def votar(self, rid: str, util: bool) -> bool:
        """Guarda el voto si la respuesta existe y no se votó antes. Devuelve si lo guardó."""
        with self._lock_votos:
            if rid not in self._votables:
                return False
            del self._votables[rid]
        ahora = self._ahora()
        self._escribir(ahora, {"id": rid, "fecha": ahora.isoformat(timespec="seconds"), "tipo": "voto", "util": util})
        return True

    def purgar(self) -> int:
        """Borra los días anteriores a hoy menos `dias`. Devuelve cuántos archivos borró."""
        limite = self._ahora().date() - timedelta(days=self.dias)
        borrados = 0
        for ruta in self.carpeta.glob("*.jsonl"):
            try:
                dia = date.fromisoformat(ruta.stem)
            except ValueError:
                continue
            if dia < limite:
                ruta.unlink()
                borrados += 1
        return borrados
