"""Mide el tiempo de respuesta del portero para varios correos (spec, punto 5).

Corre dentro de la red de Docker para hablar directo con el portero, sin el
límite por IP de Traefik:
  docker compose … run --rm -T boletin-herramientas python /app/local/tiempos.py correo1 correo2 …
Imprime un JSON {correo: mediana_ms} con 20 mediciones por correo.
"""

import json
import statistics
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlencode

PORTERO = "http://boletin-portero:8080/suscribir"
MUESTRAS = 20


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


def medir(email: str) -> float:
    data = urlencode({"email": email, "altcha": "x"}).encode()
    t0 = time.perf_counter()
    try:
        opener.open(urllib.request.Request(PORTERO, data=data, method="POST"), timeout=10)
    except urllib.error.HTTPError as e:
        if e.code != 303:
            raise
    return (time.perf_counter() - t0) * 1000


# Se intercalan los casos para que una pausa del sistema no afecte solo a uno.
tiempos = {e: [] for e in sys.argv[1:]}
for _ in range(MUESTRAS):
    for email in tiempos:
        tiempos[email].append(medir(email))
print(json.dumps({e: statistics.median(v) for e, v in tiempos.items()}))
