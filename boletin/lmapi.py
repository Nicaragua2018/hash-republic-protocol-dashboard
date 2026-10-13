"""Cliente mínimo de la API de Listmonk 6.2 (solo biblioteca estándar).

Dos modos: sesión de administrador (login con usuario y contraseña, para
configurar) o token de un usuario de API (para los borradores).
"""

import http.cookiejar
import json
import time
import urllib.error
import urllib.request
from urllib.parse import urlencode


class ListmonkError(RuntimeError):
    def __init__(self, status: int, body: dict | str):
        super().__init__(f"Listmonk respondió {status}: {body}")
        self.status = status
        self.body = body


class Client:
    def __init__(self, base_url: str, token: str | None = None):
        self.base = base_url.rstrip("/")
        self.token = token
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def wait_ready(self, timeout: float = 90) -> None:
        end = time.time() + timeout
        while True:
            try:
                with self.opener.open(f"{self.base}/health", timeout=5) as r:
                    if r.status == 200:
                        return
            except (urllib.error.URLError, OSError):
                pass
            if time.time() > end:
                raise TimeoutError("Listmonk no respondió a tiempo")
            time.sleep(2)

    def login(self, user: str, password: str) -> None:
        data = urlencode({"username": user, "password": password}).encode()
        self.opener.open(urllib.request.Request(f"{self.base}/admin/login", data=data), timeout=15)
        status, _ = self.raw("GET", "/api/settings")
        if status != 200:
            raise ListmonkError(status, "no se pudo iniciar sesión (¿TOTP activo o contraseña cambiada?)")

    def raw(self, method: str, path: str, body: dict | None = None) -> tuple[int, dict]:
        headers = {"Accept": "application/json"}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        req = urllib.request.Request(f"{self.base}{path}", data=data, method=method, headers=headers)
        try:
            with self.opener.open(req, timeout=30) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            raw = e.read()
            try:
                return e.code, json.loads(raw)
            except ValueError:
                return e.code, {"message": raw.decode("utf-8", "replace")}

    def _ok(self, method: str, path: str, body: dict | None = None):
        status, out = self.raw(method, path, body)
        if status >= 300:
            raise ListmonkError(status, out)
        return out.get("data", out)

    def get(self, path: str):
        return self._ok("GET", path)

    def post(self, path: str, body: dict):
        return self._ok("POST", path, body)

    def put(self, path: str, body: dict):
        return self._ok("PUT", path, body)

    def delete(self, path: str):
        return self._ok("DELETE", path)
