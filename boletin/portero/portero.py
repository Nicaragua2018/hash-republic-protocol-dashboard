"""Portero del boletín: la única entrada pública para suscribirse.

Recibe el formulario del blog y responde siempre lo mismo (303 a la página de
confirmación) antes de hablar con Listmonk, así ni el contenido ni el tiempo
de la respuesta revelan si un correo ya estaba en la lista. En segundo plano
reenvía a Listmonk, que verifica el ALTCHA y envía la confirmación. Limita a
una confirmación por dirección cada 24 h y a un total global en 24 h. Solo
guarda HMAC de las direcciones, con una clave que vive en memoria.
"""

import hashlib
import hmac
import json
import logging
import os
import secrets
import threading
import time
import urllib.error
import urllib.request
from collections import deque
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode

MAX_BODY = 8192
DAY = 24 * 3600

log = logging.getLogger("portero")


def normalize_email(raw: str) -> str | None:
    """Minúsculas y sin espacios; None si no parece un correo."""
    email = raw.strip().lower()
    if len(email) > 254 or email.count("@") != 1:
        return None
    local, domain = email.split("@")
    if not local or "." not in domain or domain.startswith(".") or domain.endswith("."):
        return None
    return email


class Limiter:
    """Una confirmación por dirección cada `window` segundos y `global_limit` en total.

    Una reserva queda "en vuelo" mientras se habla con Listmonk y termina con
    commit() (aceptada: cuenta) o release() (rechazada: no cuenta). Otra
    petición para la misma dirección, o cuando el cupo global solo está lleno
    por reservas en vuelo, espera a que terminen en vez de descartarse: así un
    bot con un ALTCHA falso no puede quitarle el turno a la persona real.
    """

    def __init__(self, global_limit: int, window: int = DAY, clock=time.monotonic,
                 max_wait: float = 60.0):
        self._key = secrets.token_bytes(32)
        self._window = window
        self._global_limit = global_limit
        self._clock = clock
        self.max_wait = max_wait
        self._cond = threading.Condition()
        self._by_address: dict[bytes, float] = {}
        self._recent: deque[float] = deque()
        self._pending: set[bytes] = set()

    def _digest(self, email: str) -> bytes:
        return hmac.new(self._key, email.encode(), hashlib.sha256).digest()

    def _purge(self, now: float) -> None:
        while self._recent and now - self._recent[0] >= self._window:
            self._recent.popleft()
        expired = [d for d, t in self._by_address.items() if now - t >= self._window]
        for d in expired:
            del self._by_address[d]

    def try_reserve(self, email: str) -> bool:
        digest = self._digest(email)
        deadline = time.monotonic() + self.max_wait
        with self._cond:
            while True:
                self._purge(self._clock())
                if digest in self._by_address or len(self._recent) >= self._global_limit:
                    return False
                busy = digest in self._pending
                full = len(self._recent) + len(self._pending) >= self._global_limit
                if not busy and not full:
                    self._pending.add(digest)
                    return True
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    return False
                self._cond.wait(remaining)

    def stats(self) -> dict:
        """Totales de la ventana actual, sin ninguna dirección."""
        with self._cond:
            self._purge(self._clock())
            return {"aceptadas": len(self._recent), "en_vuelo": len(self._pending),
                    "limite": self._global_limit}

    def commit(self, email: str) -> None:
        """Listmonk aceptó (o pudo haber enviado): la reserva cuenta."""
        digest = self._digest(email)
        with self._cond:
            self._pending.discard(digest)
            now = self._clock()
            self._by_address[digest] = now
            self._recent.append(now)
            self._cond.notify_all()

    def release(self, email: str) -> None:
        """Listmonk no aceptó: la reserva no cuenta y otros pueden seguir."""
        with self._cond:
            self._pending.discard(self._digest(email))
            self._cond.notify_all()


@dataclass
class Config:
    listmonk_url: str
    list_name: str
    redirect: str
    limiter: Limiter
    forward_timeout: float = 20.0
    _list_uuid: str | None = field(default=None, repr=False)

    def list_uuid(self) -> str:
        if self._list_uuid is None:
            with urllib.request.urlopen(f"{self.listmonk_url}/api/public/lists", timeout=10) as r:
                lists = json.load(r)
            self._list_uuid = next(x["uuid"] for x in lists if x["name"] == self.list_name)
        return self._list_uuid

    def forward(self, email: str, altcha: str) -> bool:
        """True si Listmonk aceptó la suscripción o pudo haberla aceptado.

        Si la petición ya salió y la respuesta tarda más de forward_timeout,
        Listmonk pudo haber enviado la confirmación: cuenta como aceptada para
        no enviar otra a la misma dirección.
        """
        try:
            data = urlencode({"email": email, "l": self.list_uuid(), "altcha": altcha}).encode()
        except (urllib.error.URLError, OSError, StopIteration, ValueError):
            return False
        req = urllib.request.Request(
            f"{self.listmonk_url}/subscription/form", data=data, method="POST",
            headers={"Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=self.forward_timeout) as r:
                return r.status == 200
        except TimeoutError:
            return True  # la petición salió; la respuesta no llegó a tiempo
        except (urllib.error.URLError, OSError):
            # Respuesta de error, o no se pudo conectar (la petición no salió).
            return False

    def process(self, email: str, altcha: str) -> None:
        if not self.limiter.try_reserve(email):
            self._log("limitado")
            return
        if self.forward(email, altcha):
            self.limiter.commit(email)
            self._log("reenviado")
        else:
            self.limiter.release(email)
            self._log("rechazado-o-sin-listmonk")

    def _log(self, event: str) -> None:
        # Solo totales: el registro nunca lleva direcciones ni IP.
        st = self.limiter.stats()
        log.info("%s (hoy %d/%d, en curso %d)", event, st["aceptadas"], st["limite"], st["en_vuelo"])


def make_server(cfg: Config, port: int = 8080) -> ThreadingHTTPServer:
    class Handler(BaseHTTPRequestHandler):
        server_version = "portero"
        sys_version = ""

        def log_message(self, *args):
            # Las líneas de acceso incluyen la IP: no se registran.
            pass

        def _reply(self, code: int, body: bytes = b"", location: str | None = None):
            self.send_response(code)
            if location:
                self.send_header("Location", location)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path == "/salud":
                self._reply(200, b"ok")
            else:
                self._reply(404)

        def do_POST(self):
            if self.path != "/suscribir":
                self._reply(404)
                return
            try:
                length = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                length = MAX_BODY + 1
            fields = {}
            if 0 < length <= MAX_BODY:
                fields = parse_qs(self.rfile.read(length).decode("utf-8", "replace"))
            else:
                self.close_connection = True
            # Misma respuesta para todo, antes de cualquier trabajo.
            self._reply(303, location=cfg.redirect)
            email = normalize_email(fields.get("email", [""])[0])
            altcha = fields.get("altcha", [""])[0]
            honeypot = fields.get("nonce", [""])[0]
            if email and altcha and not honeypot:
                threading.Thread(target=cfg.process, args=(email, altcha), daemon=True).start()

    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    httpd.cfg = cfg
    return httpd


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    cfg = Config(
        listmonk_url=os.environ.get("LISTMONK_URL", "http://listmonk:9000"),
        list_name=os.environ.get("BOLETIN_LIST_NAME", "Blog OpenCivic"),
        redirect=os.environ.get("BOLETIN_REDIRECT", "/blog/suscripcion"),
        limiter=Limiter(global_limit=int(os.environ.get("BOLETIN_GLOBAL_LIMIT", "100"))),
    )
    httpd = make_server(cfg, int(os.environ.get("PORT", "8080")))
    log.info("portero escuchando")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
