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
    """Una reserva por dirección cada `window` segundos y `global_limit` en total."""

    def __init__(self, global_limit: int, window: int = DAY, clock=time.monotonic):
        self._key = secrets.token_bytes(32)
        self._window = window
        self._global_limit = global_limit
        self._clock = clock
        self._lock = threading.Lock()
        self._by_address: dict[bytes, float] = {}
        self._recent: deque[float] = deque()

    def _digest(self, email: str) -> bytes:
        return hmac.new(self._key, email.encode(), hashlib.sha256).digest()

    def _purge(self, now: float) -> None:
        while self._recent and now - self._recent[0] >= self._window:
            self._recent.popleft()
        expired = [d for d, t in self._by_address.items() if now - t >= self._window]
        for d in expired:
            del self._by_address[d]

    def try_reserve(self, email: str) -> bool:
        with self._lock:
            now = self._clock()
            self._purge(now)
            digest = self._digest(email)
            if digest in self._by_address or len(self._recent) >= self._global_limit:
                return False
            self._by_address[digest] = now
            self._recent.append(now)
            return True

    def release(self, email: str) -> None:
        """Devuelve el cupo de una reserva que Listmonk no aceptó."""
        with self._lock:
            t = self._by_address.pop(self._digest(email), None)
            if t is not None:
                try:
                    self._recent.remove(t)
                except ValueError:
                    pass


@dataclass
class Config:
    listmonk_url: str
    list_name: str
    redirect: str
    limiter: Limiter
    _list_uuid: str | None = field(default=None, repr=False)

    def list_uuid(self) -> str:
        if self._list_uuid is None:
            with urllib.request.urlopen(f"{self.listmonk_url}/api/public/lists", timeout=10) as r:
                lists = json.load(r)
            self._list_uuid = next(x["uuid"] for x in lists if x["name"] == self.list_name)
        return self._list_uuid

    def forward(self, email: str, altcha: str) -> bool:
        """True si Listmonk aceptó la suscripción (ALTCHA y correo válidos)."""
        try:
            data = urlencode({"email": email, "l": self.list_uuid(), "altcha": altcha}).encode()
            req = urllib.request.Request(
                f"{self.listmonk_url}/subscription/form", data=data, method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"})
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.status == 200
        except (urllib.error.URLError, OSError, StopIteration, ValueError):
            return False

    def process(self, email: str, altcha: str) -> None:
        if not self.limiter.try_reserve(email):
            log.info("limitado")
            return
        if self.forward(email, altcha):
            log.info("reenviado")
        else:
            self.limiter.release(email)
            log.info("rechazado-o-sin-listmonk")


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
        limiter=Limiter(global_limit=int(os.environ.get("BOLETIN_GLOBAL_LIMIT", "20"))),
    )
    httpd = make_server(cfg, int(os.environ.get("PORT", "8080")))
    log.info("portero escuchando")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
