"""Límite diario de preguntas de HONEY.

El contador vive en memoria: un reinicio lo pone en cero. Se acepta porque el
tope de gasto de la consola de Anthropic sigue protegiendo (spec, punto 5).
"""

import threading
from datetime import datetime, timedelta, timezone

# Nicaragua no usa horario de verano: siempre UTC-6.
MANAGUA = timezone(timedelta(hours=-6), "America/Managua")


class LimiteDiario:
    def __init__(self, limite: int, reloj=None):
        self.limite = limite
        self._reloj = reloj or (lambda: datetime.now(MANAGUA))
        self._lock = threading.Lock()
        self._dia = None
        self._usadas = 0

    def tomar(self) -> bool:
        """True si todavía hay cupo hoy (y lo consume)."""
        with self._lock:
            hoy = self._reloj().astimezone(MANAGUA).date()
            if hoy != self._dia:
                self._dia, self._usadas = hoy, 0
            if self._usadas >= self.limite:
                return False
            self._usadas += 1
            return True
