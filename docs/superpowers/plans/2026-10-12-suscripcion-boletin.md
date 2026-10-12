# Suscripción al blog y boletín — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que las personas se suscriban al blog con doble confirmación y que cada artículo nuevo genere un borrador de campaña que solo Carlos puede enviar, todo autoalojado en el VPS.

**Architecture:** Listmonk 6.2 y PostgreSQL 17 corren en el mismo `docker-compose.yml` del sitio. Un servicio propio, el **portero** (Python, solo biblioteca estándar), es la única entrada pública para suscribirse: responde siempre igual y limita por destinatario. Traefik v3 enruta, bloquea los endpoints peligrosos y limita por IP. Los borradores los crea el script de despliegue del VPS con un token que nunca sale del servidor.

**Tech Stack:** Docker Compose, Traefik v3 (etiquetas Docker), Listmonk v6.2.0, PostgreSQL 17, Python 3.13 (solo biblioteca estándar), React 19 + Vite 8 (sitio existente), `age` para las copias, Backblaze B2.

**Spec:** `docs/superpowers/specs/2026-10-11-suscripcion-boletin-design.md` (versión 2.1, aprobada por Carlos el 12 de octubre de 2026).

## Global Constraints

- Imagen de Listmonk fijada a `listmonk/listmonk:v6.2.0`; PostgreSQL `postgres:17-alpine`; portero y herramientas `python:3.13-alpine`.
- El código Python usa **solo la biblioteca estándar** (sin `pip install`).
- Se pide **solo el correo**. Nada guarda IP ni rastrea aperturas o clics: `privacy.disable_tracking = true`, `privacy.individual_tracking = false`, `privacy.record_optin_ip = false`.
- Lista pública **"Blog OpenCivic"** con doble confirmación. Lista privada **"Revisión"**, con `info@opencivicsolutions.org` como único suscriptor.
- Presupuesto diario del correo gratuito de Hostinger, 100 en 24 horas: campañas **70** (ventana deslizante de Listmonk, `24h`, ritmo `70`), confirmaciones **20** (límite global del portero), vistas previas y margen **10**.
- Portero: **1 confirmación por dirección cada 24 h**, **20 en total cada 24 h**. Responde **303 a `/blog/suscripcion`** antes de hablar con Listmonk. Guarda solo HMAC de las direcciones, con una clave aleatoria en memoria.
- Límites de Traefik por IP: `/boletin/suscribir` 10/min; `/boletin/altcha` 30/min; login, 2FA, olvido y restablecimiento del panel 5/min (ráfaga 5).
- Traefik bloquea desde fuera, en el subdominio del boletín: `/api/public/subscription`, `POST /subscription/form` y cualquier `/api/*` con `Authorization: token …`.
- Rol `borradores`: permisos `campaigns:get`, `campaigns:manage` y `templates:get`; acceso a listas **solo** a "Revisión". Su token vive **solo** en el `.env` del VPS. GitHub no guarda credenciales de Listmonk.
- Los borradores se llaman `articulo:<slug>`. Nunca se crean dos con el mismo nombre.
- Copias: `pg_dump` → gzip → `age` con la **clave pública** de Carlos. 14 días en el VPS y subida a B2 con una llave de **solo escritura**. La clave privada vive en el gestor de contraseñas de Carlos.
- La contraseña SMTP del buzón la escribe **Carlos en el panel**. Ningún script ni mensaje del chat la contiene.
- Textos visibles en español. Comentarios de código en español, como en `scripts/prerender.mjs`.
- Ruta del repositorio en el VPS: `/docker/hrp-dashboard`. El proyecto de Compose se llama `hrp-dashboard`.

### Desviaciones del spec, decididas al planificar

1. **El widget ALTCHA es el que sirve Listmonk** (`/public/static/altcha.umd.js`, expuesto como `/boletin/altcha.js`), no el paquete npm `altcha` 3.3. Así el widget y el verificador del servidor siempre son de la misma versión.
2. **No se configura un `next` de confianza en Listmonk.** El portero ya responde de forma uniforme y `POST /subscription/form` está bloqueado desde fuera. Además, con `next` Listmonk respondería 303 y el portero tendría que distinguirlo de un fallo.
3. **El portero descarta los envíos con el campo trampa `nonce` lleno**, igual que hace Listmonk. Es una defensa más, sin costo.

## Review Focus

1. **Dirección escrita con mayúsculas o espacios** (`Ana@Correo.org `). Debe contar como la misma que `ana@correo.org` para el límite de 24 h. Prueba en la tarea 1 (`test_misma_direccion_con_mayusculas_y_espacios`).
2. **Listmonk caído o lento cuando alguien se suscribe.** El visitante debe recibir el 303 igual de rápido y su cupo no debe gastarse. Prueba en la tarea 1 (`test_listmonk_caido_no_gasta_cupo`).
3. **Cuerpo del formulario enorme o malformado.** El portero no debe caerse ni responder distinto. Prueba en la tarea 1 (`test_cuerpo_enorme_responde_igual`).
4. **Artículo nuevo sin imagen o con comillas y `&` en el título.** El borrador debe crearse con el HTML escapado y sin imagen rota. Prueba en la tarea 4 (`test_html_escapa_y_omite_imagen_ausente`).
5. **Un artículo con slug `suscripcion`** pisaría la página `/blog/suscripcion` en el prerender. El build debe fallar con un mensaje claro. Prueba en la tarea 5 (paso de verificación del prerender).

---

## Estructura de archivos

| Archivo                                                                                                      | Responsabilidad                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `boletin/portero/portero.py`                                                                                 | Servicio HTTP del portero: limitador, respuesta uniforme, reenvío a Listmonk                                                                               |
| `boletin/portero/test_portero.py`                                                                            | Pruebas del portero (unittest, con un Listmonk falso)                                                                                                      |
| `boletin/portero/Dockerfile`                                                                                 | Imagen del portero                                                                                                                                         |
| `docker-compose.yml`                                                                                         | Servicios nuevos `boletin-db`, `listmonk`, `boletin-portero` y `boletin-herramientas`, más las etiquetas de Traefik; los hosts del `web` pasan a variables |
| `boletin/local/compose.local.yml`                                                                            | Agregados solo para pruebas locales: Traefik, Mailpit y puertos                                                                                            |
| `boletin/local/local.env`                                                                                    | Valores de prueba (no secretos) para la pila local                                                                                                         |
| `boletin/lmapi.py`                                                                                           | Cliente mínimo de la API de Listmonk (sesión o token), compartido por los scripts                                                                          |
| `boletin/configurar.py`                                                                                      | Configuración idempotente de Listmonk: ajustes, listas, plantilla, rol y usuario `borradores`                                                              |
| `boletin/plantilla-correo.html`                                                                              | Plantilla de la marca para campañas                                                                                                                        |
| `boletin/borrador.py`                                                                                        | Crea el borrador `articulo:<slug>` y envía la vista previa                                                                                                 |
| `boletin/test_borrador.py`                                                                                   | Pruebas de `borrador.py` (con una API falsa)                                                                                                               |
| `boletin/local/e2e.py`                                                                                       | Pruebas de extremo a extremo de los puntos 1, 2 y 5 del spec contra la pila local                                                                          |
| `boletin/respaldo/respaldo.sh`                                                                               | Copia diaria en el VPS                                                                                                                                     |
| `boletin/respaldo/subir_b2.py`                                                                               | Subida a B2 con la API nativa (solo escritura)                                                                                                             |
| `boletin/respaldo/test_subir_b2.py`                                                                          | Pruebas del subidor (con un B2 falso)                                                                                                                      |
| `boletin/respaldo/age-recipient.txt`                                                                         | Clave pública `age` de Carlos (se agrega en la tarea 9)                                                                                                    |
| `deploy/opencivic-deploy.sh`                                                                                 | Versión versionada del comando forzado del VPS, con creación de borradores                                                                                 |
| `src/components/SuscripcionForm.jsx`                                                                         | Formulario con ALTCHA y texto de privacidad                                                                                                                |
| `src/pages/Suscripcion.jsx`                                                                                  | Página `/blog/suscripcion` con el mensaje único                                                                                                            |
| `src/App.jsx`, `src/content/seo.js`, `src/pages/Blog.jsx`, `src/pages/BlogPost.jsx`, `scripts/prerender.mjs` | Cableado del formulario y de la página nueva                                                                                                               |
| `.github/workflows/deploy.yml`                                                                               | Comprueba también `boletin.opencivicsolutions.org/health`                                                                                                  |

Las pruebas de Python se ejecutan siempre en un contenedor, con la misma versión que en producción:

```bash
docker run --rm -v "$PWD/boletin:/app" -w /app python:3.13-alpine python -m unittest -v <módulo>
```

En Git Bash para Windows, antepón `MSYS_NO_PATHCONV=1` a los comandos `docker run` que montan rutas.

---

### Task 1: Portero del boletín

**Files:**

- Create: `boletin/portero/portero.py`
- Create: `boletin/portero/test_portero.py`
- Create: `boletin/portero/Dockerfile`

**Interfaces:**

- Consumes: Listmonk `POST /subscription/form` (form: `email`, `l`, `altcha`) → 200 si aceptó y 400 si el captcha o el correo no son válidos. `GET /api/public/lists` → `[{"uuid": "...", "name": "..."}]`.
- Produces: `POST /suscribir` (form `email`, `altcha`, `nonce`) → siempre `303` con `Location: $BOLETIN_REDIRECT`. `GET /salud` → `200 ok`. Variables de entorno: `LISTMONK_URL` (por defecto `http://listmonk:9000`), `BOLETIN_LIST_NAME` (por defecto `Blog OpenCivic`), `BOLETIN_REDIRECT` (por defecto `/blog/suscripcion`), `BOLETIN_GLOBAL_LIMIT` (por defecto `20`), `PORT` (por defecto `8080`).

- [ ] **Step 1: Write the failing tests**

`boletin/portero/test_portero.py`:

```python
"""Pruebas del portero. Usan un Listmonk falso en un hilo."""

import http.server
import threading
import time
import unittest
import urllib.error
import urllib.request
from urllib.parse import parse_qs, urlencode

import portero

LIST_UUID = "11111111-1111-1111-1111-111111111111"


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


class LimiterTest(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.lim = portero.Limiter(global_limit=3, window=86400, clock=self.clock)

    def test_una_por_direccion_cada_24h(self):
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("ana@ejemplo.org"))
        self.clock.now += 86401
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))

    def test_limite_global(self):
        for i in range(3):
            self.assertTrue(self.lim.try_reserve(f"p{i}@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("otra@ejemplo.org"))
        self.clock.now += 86401
        self.assertTrue(self.lim.try_reserve("otra@ejemplo.org"))

    def test_release_devuelve_el_cupo(self):
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))
        self.lim.release("ana@ejemplo.org")
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))
        for i in range(2):
            self.assertTrue(self.lim.try_reserve(f"p{i}@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("x@ejemplo.org"))

    def test_no_guarda_direcciones_legibles(self):
        self.lim.try_reserve("ana@ejemplo.org")
        self.assertNotIn("ana@ejemplo.org", repr(self.lim.__dict__))


class NormalizeTest(unittest.TestCase):
    def test_misma_direccion_con_mayusculas_y_espacios(self):
        self.assertEqual(portero.normalize_email("  Ana@Correo.ORG "), "ana@correo.org")

    def test_rechaza_lo_que_no_es_correo(self):
        for bad in ["", "sin-arroba", "a@b@c", "@ejemplo.org", "ana@", "a" * 250 + "@x.org"]:
            self.assertIsNone(portero.normalize_email(bad), bad)


class FakeListmonk:
    """Servidor falso: registra cada envío y responde lo que se le indique."""

    def __init__(self, status=200, delay=0.0):
        self.status, self.delay, self.received = status, delay, []
        fake = self

        class H(http.server.BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def do_GET(self):
                if self.path == "/api/public/lists":
                    body = b'[{"uuid": "%s", "name": "Blog OpenCivic"}]' % LIST_UUID.encode()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(body)
                else:
                    self.send_response(404)
                    self.end_headers()

            def do_POST(self):
                n = int(self.headers.get("Content-Length") or 0)
                fields = parse_qs(self.rfile.read(n).decode())
                time.sleep(fake.delay)
                fake.received.append(fields)
                self.send_response(fake.status)
                self.end_headers()

        self.httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.httpd.server_port}"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def post(url, fields=None, raw=None):
    data = raw if raw is not None else urlencode(fields).encode()
    req = urllib.request.Request(url + "/suscribir", data=data, method="POST",
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    opener = urllib.request.build_opener(NoRedirect)
    try:
        r = opener.open(req, timeout=5)
        return r.status, r.headers.get("Location"), r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location"), e.read()


class PorteroHTTPTest(unittest.TestCase):
    def start(self, fake, global_limit=20):
        cfg = portero.Config(listmonk_url=fake.url, list_name="Blog OpenCivic",
                             redirect="/blog/suscripcion",
                             limiter=portero.Limiter(global_limit=global_limit))
        self.httpd = portero.make_server(cfg, port=0)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.addCleanup(self.httpd.server_close)
        self.addCleanup(self.httpd.shutdown)
        return f"http://127.0.0.1:{self.httpd.server_port}"

    def wait_for(self, cond, timeout=3.0):
        end = time.time() + timeout
        while time.time() < end:
            if cond():
                return True
            time.sleep(0.02)
        return cond()

    def test_reenvia_con_lista_y_altcha(self):
        fake = FakeListmonk()
        url = self.start(fake)
        status, loc, _ = post(url, {"email": "Ana@Ejemplo.org", "altcha": "payload"})
        self.assertEqual((status, loc), (303, "/blog/suscripcion"))
        self.assertTrue(self.wait_for(lambda: len(fake.received) == 1))
        sent = fake.received[0]
        self.assertEqual(sent["email"], ["ana@ejemplo.org"])
        self.assertEqual(sent["l"], [LIST_UUID])
        self.assertEqual(sent["altcha"], ["payload"])

    def test_respuesta_identica_en_todos_los_casos(self):
        fake = FakeListmonk()
        url = self.start(fake)
        cases = [{"email": "nueva@ejemplo.org", "altcha": "x"},
                 {"email": "nueva@ejemplo.org", "altcha": "x"},
                 {"email": "no-es-correo", "altcha": "x"},
                 {"email": "sin@altcha.org"},
                 {"email": "bot@ejemplo.org", "altcha": "x", "nonce": "lleno"}]
        responses = {post(url, c) for c in cases}
        self.assertEqual(len(responses), 1, responses)
        self.assertTrue(self.wait_for(lambda: len(fake.received) == 1))
        time.sleep(0.3)
        self.assertEqual(len(fake.received), 1)

    def test_responde_antes_de_hablar_con_listmonk(self):
        fake = FakeListmonk(delay=2.0)
        url = self.start(fake)
        t0 = time.perf_counter()
        status, _, _ = post(url, {"email": "lenta@ejemplo.org", "altcha": "x"})
        self.assertEqual(status, 303)
        self.assertLess(time.perf_counter() - t0, 0.5)

    def test_captcha_invalido_no_gasta_cupo(self):
        fake = FakeListmonk(status=400)
        url = self.start(fake)
        post(url, {"email": "ana@ejemplo.org", "altcha": "malo"})
        self.assertTrue(self.wait_for(lambda: len(fake.received) == 1))
        fake.status = 200
        time.sleep(0.1)
        post(url, {"email": "ana@ejemplo.org", "altcha": "bueno"})
        self.assertTrue(self.wait_for(lambda: len(fake.received) == 2))

    def test_listmonk_caido_no_gasta_cupo(self):
        fake = FakeListmonk()
        url = self.start(fake)
        fake.httpd.shutdown()
        fake.httpd.server_close()
        status, loc, _ = post(url, {"email": "ana@ejemplo.org", "altcha": "x"})
        self.assertEqual((status, loc), (303, "/blog/suscripcion"))
        time.sleep(0.5)
        self.assertTrue(self.httpd.cfg.limiter.try_reserve("ana@ejemplo.org"))

    def test_limite_global_por_http(self):
        fake = FakeListmonk()
        url = self.start(fake, global_limit=2)
        for i in range(3):
            post(url, {"email": f"p{i}@ejemplo.org", "altcha": "x"})
        time.sleep(0.5)
        self.assertEqual(len(fake.received), 2)

    def test_cuerpo_enorme_responde_igual(self):
        fake = FakeListmonk()
        url = self.start(fake)
        status, loc, _ = post(url, raw=b"email=" + b"a" * 20000)
        self.assertEqual((status, loc), (303, "/blog/suscripcion"))
        status, loc, _ = post(url, raw=b"\xff\xfe%%%")
        self.assertEqual((status, loc), (303, "/blog/suscripcion"))
        self.assertEqual(fake.received, [])

    def test_salud_y_rutas_desconocidas(self):
        url = self.start(FakeListmonk())
        with urllib.request.urlopen(url + "/salud", timeout=5) as r:
            self.assertEqual(r.status, 200)
        with self.assertRaises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(url + "/otra", timeout=5)
        self.assertEqual(e.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin/portero:/app" -w /app python:3.13-alpine python -m unittest -v test_portero`
Expected: FAIL con `ModuleNotFoundError: No module named 'portero'`.

- [ ] **Step 3: Write the implementation**

`boletin/portero/portero.py`:

```python
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
```

`boletin/portero/Dockerfile`:

```dockerfile
FROM python:3.13-alpine
WORKDIR /app
COPY portero.py .
USER nobody
EXPOSE 8080
CMD ["python", "-u", "portero.py"]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin/portero:/app" -w /app python:3.13-alpine python -m unittest -v test_portero`
Expected: `Ran 14 tests` … `OK`.

Run: `docker build -q -t opencivic-portero-prueba boletin/portero`
Expected: imprime un `sha256:…` sin errores.

- [ ] **Step 5: Commit**

```bash
git add boletin/portero
git commit -m "Portero del boletín: respuesta uniforme y límite por destinatario"
```

---

### Task 2: Servicios en Compose, enrutamiento en Traefik y pila local

**Files:**

- Modify: `docker-compose.yml`
- Create: `boletin/local/compose.local.yml`
- Create: `boletin/local/local.env`
- Create: `boletin/local/traefik.yml`
- Create: `boletin/local/rutas.sh`

**Interfaces:**

- Consumes: imagen del portero (tarea 1), `GET /salud`.
- Produces:
  - Servicios `boletin-db`, `listmonk` (alias interno `listmonk:9000`), `boletin-portero` y `boletin-herramientas` (perfil `herramientas`, `python:3.13-alpine`, monta `./boletin` en `/app` y `./src/content/posts` en `/posts`).
  - Variables de `.env`: `SITE_HOST`, `BOLETIN_HOST`, `BOLETIN_DB_PASSWORD`, `BOLETIN_ADMIN_USER`, `BOLETIN_ADMIN_PASSWORD`, `BOLETIN_BORRADORES_TOKEN`, `BOLETIN_GLOBAL_LIMIT`.
  - Pila local: `https://localhost:58443` (sitio) y `https://boletin.localhost:58443` (panel). Listmonk directo en `http://127.0.0.1:59000`, Mailpit en `http://127.0.0.1:58025`.

- [ ] **Step 1: Write the failing route check**

`boletin/local/rutas.sh`:

```bash
#!/bin/sh
# Comprueba el enrutamiento de Traefik en la pila local. Uso: sh boletin/local/rutas.sh
set -u
S=https://localhost:58443
B=https://boletin.localhost:58443
R="--resolve boletin.localhost:58443:127.0.0.1 --resolve localhost:58443:127.0.0.1"
fail=0
check() { # descripción, código esperado, argumentos de curl
  desc=$1; want=$2; shift 2
  got=$(curl -sk $R -o /dev/null -w '%{http_code}' "$@")
  if [ "$got" = "$want" ]; then echo "ok    $desc ($got)"; else echo "FALLA $desc: esperado $want, recibido $got"; fail=1; fi
}
check "panel responde"                       200 "$B/health"
check "reto ALTCHA en el sitio"              200 "$S/boletin/altcha"
check "widget ALTCHA en el sitio"            200 "$S/boletin/altcha.js"
check "portero responde 303"                 303 -X POST -d "email=a@b.org" "$S/boletin/suscribir"
check "API pública de suscripción bloqueada" 403 -X POST -H 'Content-Type: application/json' -d '{}' "$B/api/public/subscription"
check "formulario directo bloqueado"         403 -X POST -d "email=a@b.org" "$B/subscription/form"
check "API con token bloqueada"              403 -H "Authorization: token borradores:x" "$B/api/campaigns"
check "página de confirmación del opt-in"    200 "$B/subscription/form"
exit $fail
```

- [ ] **Step 2: Run it to verify it fails**

Run: `sh boletin/local/rutas.sh`
Expected: todas las líneas `FALLA … recibido 000` (no hay nada escuchando).

- [ ] **Step 3: Add the services to `docker-compose.yml`**

Cambia las etiquetas del servicio `web` para que los hosts salgan de variables. Los valores por defecto son los de producción, así que en el VPS no cambia nada:

```yaml
- traefik.http.routers.hrp-dashboard.rule=Host(`${SITE_HOST:-opencivicsolutions.org}`) || Host(`www.${SITE_HOST:-opencivicsolutions.org}`)
```

Agrega al final de `services:` (antes de `volumes:`). El fragmento está escrito sin la sangría de `services:`: al pegarlo, cada línea va **dos espacios** más a la derecha, igual que los servicios `web` y `comments`. Lo mismo vale para las dos líneas de `volumes:`.

```yaml
# ── Boletín (spec: docs/superpowers/specs/2026-10-11-suscripcion-boletin-design.md) ──
boletin-db:
  image: postgres:17-alpine
  container_name: opencivic-boletin-db
  restart: unless-stopped
  environment:
    POSTGRES_USER: listmonk
    POSTGRES_PASSWORD: ${BOLETIN_DB_PASSWORD:?falta BOLETIN_DB_PASSWORD en .env}
    POSTGRES_DB: listmonk
  volumes:
    - boletin-db:/var/lib/postgresql/data
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U listmonk']
    interval: 5s
    retries: 30

listmonk:
  image: listmonk/listmonk:v6.2.0
  container_name: opencivic-listmonk
  restart: unless-stopped
  depends_on:
    boletin-db:
      condition: service_healthy
  environment:
    LISTMONK_app__address: 0.0.0.0:9000
    LISTMONK_db__host: boletin-db
    LISTMONK_db__port: '5432'
    LISTMONK_db__user: listmonk
    LISTMONK_db__password: ${BOLETIN_DB_PASSWORD:?falta BOLETIN_DB_PASSWORD en .env}
    LISTMONK_db__database: listmonk
    LISTMONK_db__ssl_mode: disable
    # Solo se usan la primera vez, para crear la cuenta de Carlos.
    LISTMONK_ADMIN_USER: ${BOLETIN_ADMIN_USER:?falta BOLETIN_ADMIN_USER en .env}
    LISTMONK_ADMIN_PASSWORD: ${BOLETIN_ADMIN_PASSWORD:?falta BOLETIN_ADMIN_PASSWORD en .env}
    TZ: America/Managua
  command:
    [
      sh,
      -c,
      "./listmonk --install --idempotent --yes --config '' && ./listmonk --upgrade --yes --config '' && ./listmonk --config ''",
    ]
  volumes:
    - boletin-uploads:/listmonk/uploads
  labels:
    - traefik.enable=true
    - traefik.http.services.opencivic-listmonk.loadbalancer.server.port=9000
    # Panel y páginas públicas de Listmonk en el subdominio.
    - traefik.http.routers.boletin.rule=Host(`${BOLETIN_HOST:-boletin.opencivicsolutions.org}`)
    - traefik.http.routers.boletin.priority=10
    - traefik.http.routers.boletin.entrypoints=websecure
    - traefik.http.routers.boletin.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin.service=opencivic-listmonk
    # Lo que nunca debe llegar desde internet (spec, punto 1 y 2): 403.
    - traefik.http.routers.boletin-bloqueos.rule=Host(`${BOLETIN_HOST:-boletin.opencivicsolutions.org}`) && (Path(`/api/public/subscription`) || (Path(`/subscription/form`) && Method(`POST`)) || (PathPrefix(`/api`) && HeaderRegexp(`Authorization`, `(?i)^token `)))
    - traefik.http.routers.boletin-bloqueos.priority=300
    - traefik.http.routers.boletin-bloqueos.entrypoints=websecure
    - traefik.http.routers.boletin-bloqueos.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin-bloqueos.middlewares=boletin-denegar
    - traefik.http.routers.boletin-bloqueos.service=opencivic-listmonk
    - traefik.http.middlewares.boletin-denegar.ipallowlist.sourcerange=127.0.0.1/32
    # Límite de intentos de inicio de sesión (Listmonk no tiene uno propio).
    - traefik.http.routers.boletin-login.rule=Host(`${BOLETIN_HOST:-boletin.opencivicsolutions.org}`) && Method(`POST`) && (Path(`/admin/login`) || Path(`/admin/login/twofa`) || Path(`/admin/forgot`) || Path(`/admin/reset`))
    - traefik.http.routers.boletin-login.priority=200
    - traefik.http.routers.boletin-login.entrypoints=websecure
    - traefik.http.routers.boletin-login.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin-login.middlewares=boletin-rl-login
    - traefik.http.routers.boletin-login.service=opencivic-listmonk
    - traefik.http.middlewares.boletin-rl-login.ratelimit.average=5
    - traefik.http.middlewares.boletin-rl-login.ratelimit.period=1m
    - traefik.http.middlewares.boletin-rl-login.ratelimit.burst=5
    # Reto y widget ALTCHA, servidos desde el dominio del sitio (sin CORS).
    - traefik.http.routers.boletin-altcha.rule=Host(`${SITE_HOST:-opencivicsolutions.org}`) && Path(`/boletin/altcha`)
    - traefik.http.routers.boletin-altcha.priority=110
    - traefik.http.routers.boletin-altcha.entrypoints=websecure
    - traefik.http.routers.boletin-altcha.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin-altcha.middlewares=boletin-rl-altcha,boletin-ruta-altcha
    - traefik.http.routers.boletin-altcha.service=opencivic-listmonk
    - traefik.http.middlewares.boletin-rl-altcha.ratelimit.average=30
    - traefik.http.middlewares.boletin-rl-altcha.ratelimit.period=1m
    - traefik.http.middlewares.boletin-rl-altcha.ratelimit.burst=30
    - traefik.http.middlewares.boletin-ruta-altcha.replacepath.path=/api/public/captcha/altcha
    - traefik.http.routers.boletin-altcha-js.rule=Host(`${SITE_HOST:-opencivicsolutions.org}`) && Path(`/boletin/altcha.js`)
    - traefik.http.routers.boletin-altcha-js.priority=110
    - traefik.http.routers.boletin-altcha-js.entrypoints=websecure
    - traefik.http.routers.boletin-altcha-js.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin-altcha-js.middlewares=boletin-ruta-altcha-js
    - traefik.http.routers.boletin-altcha-js.service=opencivic-listmonk
    - traefik.http.middlewares.boletin-ruta-altcha-js.replacepath.path=/public/static/altcha.umd.js

boletin-portero:
  build: ./boletin/portero
  container_name: opencivic-boletin-portero
  restart: unless-stopped
  environment:
    LISTMONK_URL: http://listmonk:9000
    BOLETIN_LIST_NAME: Blog OpenCivic
    BOLETIN_REDIRECT: /blog/suscripcion
    BOLETIN_GLOBAL_LIMIT: ${BOLETIN_GLOBAL_LIMIT:-20}
  healthcheck:
    test: ['CMD', 'wget', '-qO-', 'http://127.0.0.1:8080/salud']
    interval: 10s
    retries: 3
  labels:
    - traefik.enable=true
    - traefik.http.routers.boletin-suscribir.rule=Host(`${SITE_HOST:-opencivicsolutions.org}`) && Path(`/boletin/suscribir`) && Method(`POST`)
    - traefik.http.routers.boletin-suscribir.priority=110
    - traefik.http.routers.boletin-suscribir.entrypoints=websecure
    - traefik.http.routers.boletin-suscribir.tls.certresolver=letsencrypt
    - traefik.http.routers.boletin-suscribir.middlewares=boletin-rl-suscribir,boletin-quitar-prefijo
    - traefik.http.middlewares.boletin-rl-suscribir.ratelimit.average=10
    - traefik.http.middlewares.boletin-rl-suscribir.ratelimit.period=1m
    - traefik.http.middlewares.boletin-rl-suscribir.ratelimit.burst=10
    - traefik.http.middlewares.boletin-quitar-prefijo.stripprefix.prefixes=/boletin
    - traefik.http.services.opencivic-boletin-portero.loadbalancer.server.port=8080

# Herramientas de una sola ejecución (configurar, borradores, copias).
# No arranca con "up": se usa con "docker compose run --rm boletin-herramientas …".
boletin-herramientas:
  image: python:3.13-alpine
  profiles: [herramientas]
  working_dir: /app
  volumes:
    - ./boletin:/app:ro
    - ./src/content/posts:/posts:ro
  environment:
    LISTMONK_URL: http://listmonk:9000
    SITE_URL: https://${SITE_HOST:-opencivicsolutions.org}
    BOLETIN_ROOT_URL: https://${BOLETIN_HOST:-boletin.opencivicsolutions.org}
    BOLETIN_ADMIN_USER: ${BOLETIN_ADMIN_USER:-}
    BOLETIN_ADMIN_PASSWORD: ${BOLETIN_ADMIN_PASSWORD:-}
    BOLETIN_BORRADORES_TOKEN: ${BOLETIN_BORRADORES_TOKEN:-}
```

Y en `volumes:` agrega:

```yaml
boletin-db:
boletin-uploads:
```

- [ ] **Step 4: Create the local stack files**

`boletin/local/local.env` (valores de prueba, no son secretos de producción):

```bash
SITE_HOST=localhost
BOLETIN_HOST=boletin.localhost
BOLETIN_DB_PASSWORD=prueba-local
BOLETIN_ADMIN_USER=carlos
BOLETIN_ADMIN_PASSWORD=prueba-local-12345
BOLETIN_GLOBAL_LIMIT=3
BOLETIN_BORRADORES_TOKEN=
REMARK_SECRET=prueba-local
REMARK_ADMIN_PASSWD=prueba-local
```

`boletin/local/traefik.yml` (configuración estática de Traefik solo para pruebas):

```yaml
entryPoints:
  websecure:
    address: ':443'
    http:
      tls: {}
providers:
  docker:
    exposedByDefault: false
certificatesResolvers:
  # Mismo nombre que en producción; en local no obtiene certificados y
  # Traefik usa su certificado autofirmado por defecto.
  letsencrypt:
    acme:
      email: pruebas@example.org
      storage: /tmp/acme.json
      tlsChallenge: {}
log:
  level: WARN
```

`boletin/local/compose.local.yml`:

```yaml
# Solo para pruebas locales:
#   docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml \
#     up -d --build web boletin-db listmonk boletin-portero traefik mailpit
services:
  traefik:
    image: traefik:v3.6
    ports:
      - '127.0.0.1:58443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./boletin/local/traefik.yml:/etc/traefik/traefik.yml:ro
  mailpit:
    image: axllent/mailpit:latest
    ports:
      - '127.0.0.1:58025:8025'
  listmonk:
    ports:
      - '127.0.0.1:59000:9000'
  boletin-herramientas:
    environment:
      BOLETIN_SMTP: mailpit
      BOLETIN_ROOT_URL: https://boletin.localhost:58443
```

- [ ] **Step 5: Start the local stack and run the route check**

Run:

```bash
docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml up -d --build web boletin-db listmonk boletin-portero traefik mailpit
for i in $(seq 1 60); do curl -s http://127.0.0.1:59000/health | grep -q true && break; sleep 2; done
sh boletin/local/rutas.sh
```

Expected: 7 líneas `ok` y **una** `FALLA reto ALTCHA en el sitio: esperado 200, recibido 404`. Es correcto: Listmonk solo expone el reto cuando ALTCHA está activado, y eso lo hace `configurar.py` en la tarea 3, donde este script debe dar 8 de 8.

Si Traefik no expone los routers, mira `docker compose … logs traefik`. Un aviso de ACME para `localhost` es normal; un error de sintaxis en una regla no.

- [ ] **Step 6: Confirm production defaults are unchanged**

Run: `REMARK_SECRET=x REMARK_ADMIN_PASSWD=x BOLETIN_DB_PASSWORD=x BOLETIN_ADMIN_USER=x BOLETIN_ADMIN_PASSWORD=x docker compose config | grep -E "rule=Host" `
Expected: las reglas muestran `opencivicsolutions.org` y `boletin.opencivicsolutions.org`; ninguna muestra `localhost`.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml boletin/local
git commit -m "Servicios del boletín en Compose, rutas y bloqueos en Traefik, pila local de pruebas"
```

---

### Task 3: Configuración de Listmonk como código

**Files:**

- Create: `boletin/lmapi.py`
- Create: `boletin/configurar.py`
- Create: `boletin/plantilla-correo.html`

**Interfaces:**

- Consumes: pila local (tarea 2). Listmonk: `POST /admin/login` (form `username`, `password`) que deja una cookie de sesión; `GET/PUT /api/settings`; `GET/POST /api/lists`; `POST /api/subscribers`; `GET/POST/PUT /api/templates`; `GET/POST /api/roles/users`, `GET/POST /api/roles/lists`; `GET/POST /api/users`.
- Produces:
  - `lmapi.Client(base_url, token=None)` con `.login(user, password)`, `.get(path)`, `.post(path, body)`, `.put(path, body)` (devuelven `data` del JSON de Listmonk) y `.raw(method, path, body) -> (status, dict)`.
  - `python configurar.py`: idempotente. Imprime `BOLETIN_BORRADORES_TOKEN=borradores:<token>` **solo** cuando crea el usuario. Con `--rotar-token` lo borra y lo crea de nuevo.

- [ ] **Step 1: Write the API client**

`boletin/lmapi.py`:

```python
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
```

- [ ] **Step 2: Write the brand template**

`boletin/plantilla-correo.html`. Listmonk exige `{{ template "content" . }}` en las plantillas de campaña:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ .Campaign.Subject }}</title>
  </head>
  <body style="margin:0;background:#F4F6FA;font-family:Inter,Arial,sans-serif;color:#0F172A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;"
          >
            <tr>
              <td style="background:#0A3880;padding:20px 28px;">
                <img
                  src="https://opencivicsolutions.org/opencivic-horizontal-invertido.svg"
                  alt="OpenCivic Solutions"
                  height="32"
                  style="display:block;"
                />
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:16px;line-height:1.6;">{{ template "content" . }}</td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:4px solid #F2B00A;font-size:13px;color:#5A6B85;">
                Recibes este correo porque te suscribiste al blog de OpenCivic Solutions.
                <a href="{{ UnsubscribeURL }}" style="color:#0A3880;">Darte de baja</a>
                ·
                <a href="{{ ManageURL }}" style="color:#0A3880;">Tus datos y preferencias</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

- [ ] **Step 3: Write the configurator**

`boletin/configurar.py`:

```python
"""Deja Listmonk configurado como dice el spec. Se puede ejecutar varias veces.

Uso (dentro de la red de Docker):
  docker compose run --rm boletin-herramientas python configurar.py [--rotar-token]

Necesita BOLETIN_ADMIN_USER y BOLETIN_ADMIN_PASSWORD. Se usa durante la
instalación, antes de que Carlos active el doble factor.
"""

import os
import sys
import time

from lmapi import Client, ListmonkError

BLOG_LIST = "Blog OpenCivic"
REVIEW_LIST = "Revisión"
REVIEW_EMAIL = "info@opencivicsolutions.org"
TEMPLATE_NAME = "OpenCivic"
API_USER = "borradores"
USER_ROLE = "borradores"
LIST_ROLE = "solo-revision"


def configure_settings(lm: Client, root_url: str) -> None:
    s = lm.get("/api/settings")
    s.update({
        "app.root_url": root_url,
        "app.lang": "es",
        "app.from_email": "OpenCivic Solutions <boletin@opencivicsolutions.org>",
        "app.notify_emails": [REVIEW_EMAIL],
        "app.enable_public_subscription_page": True,
        "app.send_optin_confirmation": True,
        "app.message_sliding_window": True,
        "app.message_sliding_window_duration": "24h",
        "app.message_sliding_window_rate": 70,
        "privacy.disable_tracking": True,
        "privacy.individual_tracking": False,
        "privacy.record_optin_ip": False,
        "privacy.unsubscribe_header": True,
        "privacy.allow_export": True,
        "privacy.allow_wipe": True,
        "privacy.allow_preferences": True,
        "security.trusted_urls": [],
    })
    captcha = s.get("security.captcha") or {}
    captcha.setdefault("altcha", {})
    captcha["altcha"].update({"enabled": True, "complexity": captcha["altcha"].get("complexity") or 300000})
    captcha.setdefault("hcaptcha", {})["enabled"] = False
    s["security.captcha"] = captcha
    # SMTP de Hostinger. La contraseña NO va aquí: Carlos la escribe en el panel.
    # Con password vacío y el mismo uuid, Listmonk conserva la existente.
    # En la pila local, BOLETIN_SMTP=mailpit apunta al servidor de pruebas.
    if os.environ.get("BOLETIN_SMTP") == "mailpit":
        server = {"host": "mailpit", "port": 1025, "auth_protocol": "none", "username": "",
                  "tls_type": "none", "tls_skip_verify": True}
    else:
        server = {"host": "smtp.hostinger.com", "port": 465, "auth_protocol": "login",
                  "username": "boletin@opencivicsolutions.org", "tls_type": "TLS", "tls_skip_verify": False}
    smtp = [x for x in s.get("smtp", []) if x.get("host") == server["host"]]
    base = smtp[0] if smtp else {}
    s["smtp"] = [{
        **base,
        **server,
        "enabled": True,
        "password": "",
        "max_conns": 2,
        "max_msg_retries": 2,
        "idle_timeout": "15s",
        "wait_timeout": "5s",
        "hello_hostname": "",
        "email_headers": [],
    }]
    lm.put("/api/settings", s)
    time.sleep(3)  # Listmonk se reinicia al guardar: esperar a que deje de responder la instancia vieja.
    print("ajustes: ok")


def ensure_list(lm: Client, name: str, type_: str, optin: str) -> int:
    lists = lm.get("/api/lists?per_page=all&minimal=true")
    for x in lists if isinstance(lists, list) else lists.get("results", []):
        if x["name"] == name:
            return x["id"]
    created = lm.post("/api/lists", {"name": name, "type": type_, "optin": optin, "tags": ["boletin"]})
    print(f"lista creada: {name}")
    return created["id"]


def ensure_review_subscriber(lm: Client, review_id: int) -> None:
    status, out = lm.raw("POST", "/api/subscribers", {
        "email": REVIEW_EMAIL, "name": "Revisión OpenCivic", "status": "enabled",
        "lists": [review_id], "preconfirm_subscriptions": True})
    if status not in (200, 409):
        raise ListmonkError(status, out)


def ensure_template(lm: Client, body: str) -> None:
    for t in lm.get("/api/templates"):
        if t["name"] == TEMPLATE_NAME:
            lm.put(f"/api/templates/{t['id']}", {"name": TEMPLATE_NAME, "type": "campaign", "body": body})
            return
    lm.post("/api/templates", {"name": TEMPLATE_NAME, "type": "campaign", "body": body})
    print("plantilla creada")


def ensure_roles(lm: Client, review_id: int) -> tuple[int, int]:
    user_role = next((r for r in lm.get("/api/roles/users") if r["name"] == USER_ROLE), None)
    perms = ["campaigns:get", "campaigns:manage", "templates:get"]
    if user_role is None:
        user_role = lm.post("/api/roles/users", {"name": USER_ROLE, "permissions": perms})
    else:
        lm.put(f"/api/roles/users/{user_role['id']}", {"name": USER_ROLE, "permissions": perms})
    lists = [{"id": review_id, "permissions": ["list:get", "list:manage"]}]
    list_role = next((r for r in lm.get("/api/roles/lists") if r["name"] == LIST_ROLE), None)
    if list_role is None:
        list_role = lm.post("/api/roles/lists", {"name": LIST_ROLE, "lists": lists})
    else:
        lm.put(f"/api/roles/lists/{list_role['id']}", {"name": LIST_ROLE, "lists": lists})
    return user_role["id"], list_role["id"]


def ensure_api_user(lm: Client, user_role_id: int, list_role_id: int, rotate: bool) -> None:
    users = lm.get("/api/users")
    existing = next((u for u in users if u["username"] == API_USER), None)
    if existing and not rotate:
        lm.put(f"/api/users/{existing['id']}", {
            "username": API_USER, "name": "Borradores de artículos", "type": "api",
            "status": "enabled", "user_role_id": user_role_id, "list_role_id": list_role_id})
        print("usuario de API: ya existía (el token no cambia)")
        return
    if existing:
        lm.delete(f"/api/users/{existing['id']}")
    created = lm.post("/api/users", {
        "username": API_USER, "name": "Borradores de artículos", "type": "api",
        "status": "enabled", "user_role_id": user_role_id, "list_role_id": list_role_id})
    print(f"BOLETIN_BORRADORES_TOKEN={API_USER}:{created['password']}")


def main() -> None:
    lm = Client(os.environ.get("LISTMONK_URL", "http://listmonk:9000"))
    lm.wait_ready()
    lm.login(os.environ["BOLETIN_ADMIN_USER"], os.environ["BOLETIN_ADMIN_PASSWORD"])
    configure_settings(lm, os.environ["BOLETIN_ROOT_URL"])
    lm.wait_ready()  # Listmonk se reinicia al guardar los ajustes.
    lm.login(os.environ["BOLETIN_ADMIN_USER"], os.environ["BOLETIN_ADMIN_PASSWORD"])
    ensure_list(lm, BLOG_LIST, "public", "double")
    review_id = ensure_list(lm, REVIEW_LIST, "private", "single")
    ensure_review_subscriber(lm, review_id)
    with open(os.path.join(os.path.dirname(__file__), "plantilla-correo.html"), encoding="utf-8") as f:
        ensure_template(lm, f.read())
    user_role_id, list_role_id = ensure_roles(lm, review_id)
    ensure_api_user(lm, user_role_id, list_role_id, rotate="--rotar-token" in sys.argv)
    print("configuración: lista")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run it against the local stack**

En la pila local, `compose.local.yml` da a `boletin-herramientas` `BOLETIN_SMTP=mailpit` y la URL raíz con el puerto 58443:

```bash
C="docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml"
$C run --rm boletin-herramientas python configurar.py | tee "$TEMP/configurar.txt"
grep BOLETIN_BORRADORES_TOKEN "$TEMP/configurar.txt"
```

Expected:

- `ajustes: ok`, `lista creada: Blog OpenCivic`, `lista creada: Revisión`, `plantilla creada`, una línea `BOLETIN_BORRADORES_TOKEN=borradores:…` y `configuración: lista`.
- Guarda el token en `boletin/local/local.env` (`BOLETIN_BORRADORES_TOKEN=…`). Es un valor local, no de producción.

Si `POST /api/users` responde 400 por un campo faltante (por ejemplo `email`), añade `"email": "borradores@opencivicsolutions.org"` y `"password_login": False` al cuerpo y vuelve a ejecutar.

- [ ] **Step 5: Run it a second time (idempotence)**

Run: `$C run --rm boletin-herramientas python configurar.py`
Expected: `ajustes: ok`, `usuario de API: ya existía (el token no cambia)`, `configuración: lista`. **No** debe imprimir `lista creada` ni un token nuevo.

Run: `sh boletin/local/rutas.sh`
Expected: 8 líneas `ok`, incluida "página de confirmación del opt-in".

- [ ] **Step 6: Commit**

```bash
git add boletin/lmapi.py boletin/configurar.py boletin/plantilla-correo.html
git commit -m "Configuración de Listmonk como código: privacidad, ALTCHA, listas, plantilla y rol de borradores"
```

---

### Task 4: Borradores de artículos

**Files:**

- Create: `boletin/borrador.py`
- Create: `boletin/test_borrador.py`

**Interfaces:**

- Consumes: `lmapi.Client` (tarea 3). Variables: `LISTMONK_URL`, `BOLETIN_BORRADORES_TOKEN` (`borradores:<token>`), `SITE_URL`. Archivo de artículo con la cabecera de `src/content/parsePost.js` (`slug`, `title`, `dek`, `date` y, opcionales, `image` e `imageAlt`).
- Produces: `python borrador.py /posts/NN-slug.md`.
  - Si no existe, crea la campaña `articulo:<slug>` dirigida a "Revisión" y envía la vista previa a `info@`. Si ya existe, imprime `ya existe` y termina con 0.
  - Funciones puras: `parse_front_matter(text) -> dict` y `build_html(meta, site_url) -> str`.

- [ ] **Step 1: Write the failing tests**

`boletin/test_borrador.py`:

```python
import http.server
import json
import threading
import unittest

import borrador

POST = """﻿---\r
slug: las-instituciones-tambien-son-tecnologia\r
title: "Las instituciones también son tecnología"\r
dek: Una idea & una pregunta <importante>\r
date: 2026-10-11\r
image: /blog/instituciones.png\r
imageAlt: Ilustración de una colmena\r
---\r
Cuerpo del artículo.\r
"""


class PureTest(unittest.TestCase):
    def test_parse_front_matter(self):
        meta = borrador.parse_front_matter(POST)
        self.assertEqual(meta["slug"], "las-instituciones-tambien-son-tecnologia")
        self.assertEqual(meta["title"], "Las instituciones también son tecnología")
        self.assertEqual(meta["image"], "/blog/instituciones.png")

    def test_html_escapa_y_omite_imagen_ausente(self):
        meta = {"slug": "a-b", "title": 'Título "con" & comillas', "dek": "x < y"}
        html = borrador.build_html(meta, "https://opencivicsolutions.org")
        self.assertIn("x &lt; y", html)
        self.assertNotIn("<img", html)
        self.assertIn('href="https://opencivicsolutions.org/blog/a-b"', html)

    def test_html_con_imagen_absoluta(self):
        meta = borrador.parse_front_matter(POST)
        html = borrador.build_html(meta, "https://opencivicsolutions.org")
        self.assertIn('src="https://opencivicsolutions.org/blog/instituciones.png"', html)
        self.assertIn("Una idea &amp; una pregunta &lt;importante&gt;", html)


class FakeAPI:
    def __init__(self):
        self.campaigns, self.tests = [], []
        api = self

        class H(http.server.BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _send(self, code, data):
                body = json.dumps({"data": data}).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self):
                if self.path == "/health":
                    return self._send(200, True)
                if self.path.startswith("/api/campaigns"):
                    return self._send(200, {"results": api.campaigns})
                if self.path.startswith("/api/lists"):
                    return self._send(200, [{"id": 7, "name": "Revisión"}])
                if self.path.startswith("/api/templates"):
                    return self._send(200, [{"id": 3, "name": "OpenCivic"}])
                self._send(404, None)

            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                if self.path == "/api/campaigns":
                    body["id"] = len(api.campaigns) + 1
                    api.campaigns.append(body)
                    return self._send(200, body)
                if self.path.endswith("/test"):
                    api.tests.append(body)
                    return self._send(200, True)
                self._send(404, None)

        self.httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.httpd.server_port}"


class CreateDraftTest(unittest.TestCase):
    def test_crea_un_solo_borrador_y_envia_vista_previa(self):
        api = FakeAPI()
        meta = borrador.parse_front_matter(POST)
        first = borrador.create_draft(api.url, "borradores:x", meta, "https://opencivicsolutions.org")
        second = borrador.create_draft(api.url, "borradores:x", meta, "https://opencivicsolutions.org")
        self.assertEqual((first, second), ("creado", "ya existe"))
        self.assertEqual(len(api.campaigns), 1)
        c = api.campaigns[0]
        self.assertEqual(c["name"], "articulo:las-instituciones-tambien-son-tecnologia")
        self.assertEqual(c["lists"], [7])
        self.assertEqual(c["template_id"], 3)
        self.assertEqual(api.tests[0]["subscribers"], ["info@opencivicsolutions.org"])


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin:/app" -w /app python:3.13-alpine python -m unittest -v test_borrador`
Expected: FAIL con `ModuleNotFoundError: No module named 'borrador'`.

- [ ] **Step 3: Write the implementation**

`boletin/borrador.py`:

```python
"""Crea el borrador de campaña de un artículo nuevo y envía la vista previa.

Lo ejecuta el script de despliegue del VPS por cada artículo agregado:
  docker compose run --rm -T boletin-herramientas python borrador.py /posts/NN-slug.md

El token es de un usuario de API que no puede enviar campañas ni ver a los
suscriptores del blog: el borrador va a la lista "Revisión" y solo Carlos,
desde el panel, la cambia a "Blog OpenCivic" y la envía.
"""

import html
import os
import sys
from urllib.parse import quote

from lmapi import Client

REVIEW_LIST = "Revisión"
TEMPLATE_NAME = "OpenCivic"
PREVIEW_EMAIL = "info@opencivicsolutions.org"


def parse_front_matter(text: str) -> dict:
    text = text.lstrip("﻿").replace("\r\n", "\n")
    if not text.startswith("---\n"):
        raise ValueError("el artículo no tiene cabecera ---")
    head = text[4:text.index("\n---", 4)]
    meta = {}
    for line in head.split("\n"):
        key, sep, value = line.partition(":")
        if not sep:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        meta[key.strip()] = value
    for required in ("slug", "title", "dek"):
        if not meta.get(required):
            raise ValueError(f'falta "{required}" en la cabecera')
    return meta


def build_html(meta: dict, site_url: str) -> str:
    url = f"{site_url}/blog/{quote(meta['slug'])}"
    image = meta.get("image")
    img = ""
    if image:
        src = image if image.startswith("http") else site_url + image
        img = (f'<p><img src="{html.escape(src)}" alt="{html.escape(meta.get("imageAlt", ""))}" '
               'width="544" style="width:100%;height:auto;border-radius:8px;" /></p>')
    return (
        f'<h1 style="color:#0A3880;font-size:24px;line-height:1.3;">{html.escape(meta["title"])}</h1>'
        f"{img}"
        f'<p style="font-size:17px;">{html.escape(meta["dek"])}</p>'
        f'<p><a href="{html.escape(url)}" style="display:inline-block;background:#0A3880;color:#ffffff;'
        'padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">'
        "Leer el artículo</a></p>"
    )


def _find(items, name):
    rows = items if isinstance(items, list) else items.get("results", [])
    return next((x for x in rows if x["name"] == name), None)


def create_draft(listmonk_url: str, token: str, meta: dict, site_url: str) -> str:
    lm = Client(listmonk_url, token=token)
    lm.wait_ready()
    name = f"articulo:{meta['slug']}"
    found = lm.get(f"/api/campaigns?query={quote(name)}&per_page=all")
    if _find(found, name):
        return "ya existe"
    review = _find(lm.get("/api/lists?per_page=all&minimal=true"), REVIEW_LIST)
    template = _find(lm.get("/api/templates"), TEMPLATE_NAME)
    if review is None or template is None:
        raise RuntimeError("faltan la lista Revisión o la plantilla: ejecuta configurar.py")
    campaign = {
        "name": name,
        "subject": meta["title"],
        "lists": [review["id"]],
        "type": "regular",
        "content_type": "html",
        "messenger": "email",
        "body": build_html(meta, site_url),
        "template_id": template["id"],
    }
    created = lm.post("/api/campaigns", campaign)
    lm.post(f"/api/campaigns/{created['id']}/test", {**campaign, "subscribers": [PREVIEW_EMAIL]})
    return "creado"


def main() -> None:
    path = sys.argv[1]
    with open(path, encoding="utf-8") as f:
        meta = parse_front_matter(f.read())
    result = create_draft(os.environ.get("LISTMONK_URL", "http://listmonk:9000"),
                          os.environ["BOLETIN_BORRADORES_TOKEN"], meta,
                          os.environ.get("SITE_URL", "https://opencivicsolutions.org"))
    print(f"borrador articulo:{meta['slug']}: {result}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin:/app" -w /app python:3.13-alpine python -m unittest -v test_borrador`
Expected: `Ran 4 tests` … `OK`.

- [ ] **Step 5: Run it against the local stack twice**

```bash
C="docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml"
$C run --rm -T boletin-herramientas python borrador.py /posts/03-las-instituciones-tambien-son-tecnologia.md
$C run --rm -T boletin-herramientas python borrador.py /posts/03-las-instituciones-tambien-son-tecnologia.md
curl -s "http://127.0.0.1:58025/api/v1/search?query=to:info@opencivicsolutions.org" | grep -o '"Subject":"[^"]*"'
```

Expected:

- `borrador articulo:las-instituciones-tambien-son-tecnologia: creado`, y luego `…: ya existe`.
- Mailpit muestra **un** asunto con el título del artículo, con el prefijo de prueba de Listmonk.

- [ ] **Step 6: Commit**

```bash
git add boletin/borrador.py boletin/test_borrador.py
git commit -m "Borrador automático por artículo, dirigido a la lista Revisión y con vista previa"
```

---

### Task 5: Formulario y página de confirmación en el sitio

**Files:**

- Create: `src/components/SuscripcionForm.jsx`
- Create: `src/pages/Suscripcion.jsx`
- Modify: `src/App.jsx` (ruta nueva antes de `/blog/:slug`)
- Modify: `src/content/seo.js` (entrada `/blog/suscripcion` en `PAGES`)
- Modify: `src/pages/Blog.jsx` (reemplaza el formulario `mailto:`)
- Modify: `src/pages/BlogPost.jsx` (formulario antes de los comentarios)
- Modify: `scripts/prerender.mjs` (falla si un artículo usa un slug reservado)

**Interfaces:**

- Consumes: `POST /boletin/suscribir` (portero), `GET /boletin/altcha` y `GET /boletin/altcha.js` (tarea 2).
- Produces: `<SuscripcionForm />` sin props y la página `/blog/suscripcion`.

- [ ] **Step 1: Write the failing check (prerender guard)**

Crea temporalmente `src/content/posts/99-prueba.md`:

```markdown
---
slug: suscripcion
title: Prueba
dek: Prueba
date: 2026-10-12
---

Hola.
```

Run: `npm run build`
Expected hoy: el build **termina sin error** y pisa `dist/blog/suscripcion.html`. Ese es el fallo que se corrige.

- [ ] **Step 2: Add the page, the route and the SEO entry**

`src/pages/Suscripcion.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

// Única respuesta del formulario, para cualquier correo: no revela si la
// dirección ya estaba suscrita (spec del boletín, punto 5).
export default function Suscripcion() {
  return (
    <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
      <Seo {...PAGES['/blog/suscripcion']} />
      <div className="oc-hero-bees" aria-hidden="true" />
      <div className="oc-container oc-prose" style={{ position: 'relative' }}>
        <span className="oc-eyebrow">Boletín</span>
        <h1 className="oc-h1">Revisa tu correo</h1>
        <p className="oc-lede">
          Si el correo es válido y no estaba suscrito, en unos minutos recibirás un mensaje para confirmar.
          Revisa también la carpeta de spam.
        </p>
        <p>Solo quedarás suscrito si confirmas desde ese mensaje.</p>
        <Link to="/blog" className="oc-btn oc-btn--outline">
          Volver al blog
        </Link>
      </div>
    </section>
  );
}
```

En `src/content/seo.js`, dentro de `PAGES`, después de `'/blog'`:

```js
  '/blog/suscripcion': {
    title: 'Revisa tu correo — Boletín de OpenCivic Solutions',
    description: 'Confirma tu suscripción al boletín de OpenCivic Solutions desde el mensaje que te enviamos.',
  },
```

En `src/App.jsx`, importa la página y agrega la ruta **antes** de `/blog/:slug`:

```jsx
import Suscripcion from './pages/Suscripcion';
```

```jsx
          <Route path="/blog/suscripcion" element={<Suscripcion />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
```

- [ ] **Step 3: Add the prerender guard**

En `scripts/prerender.mjs`, justo después de construir `posts`:

```js
// Un artículo no puede usar la URL de una página del sitio (por ejemplo
// /blog/suscripcion): el prerender la pisaría sin avisar.
for (const post of posts) {
  if (PAGES[`/blog/${post.slug}`]) {
    throw new Error(`prerender: el slug "${post.slug}" está reservado por una página del sitio`);
  }
}
```

- [ ] **Step 4: Verify the guard, then remove the test post**

Run: `npm run build`
Expected: FAIL con `prerender: el slug "suscripcion" está reservado por una página del sitio`.

Run: `rm src/content/posts/99-prueba.md && npm run build`
Expected: pasa, y `dist/blog/suscripcion.html` existe y contiene `Revisa tu correo — Boletín`.

- [ ] **Step 5: Write the form component**

`src/components/SuscripcionForm.jsx`:

```jsx
import React, { useEffect } from 'react';

const WIDGET_SRC = '/boletin/altcha.js';

// Formulario HTML normal hacia el portero (/boletin/suscribir). El widget
// ALTCHA es el que sirve Listmonk, así siempre coincide con su verificador.
// Funciona sin JavaScript propio: el navegador envía el formulario.
export default function SuscripcionForm() {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = WIDGET_SRC;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="oc-card">
      <h2 style={{ fontSize: '1.3rem' }}>Suscríbete al boletín</h2>
      <p style={{ fontSize: '0.92rem' }}>Te escribimos cuando publicamos un artículo nuevo.</p>
      <form method="post" action="/boletin/suscribir" style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          style={{
            padding: '12px 16px',
            borderRadius: 999,
            border: '1px solid rgba(10,56,128,0.25)',
            fontSize: '0.95rem',
          }}
        />
        {/* Campo trampa: las personas no lo ven; si viene lleno, es un bot. */}
        <input
          type="text"
          name="nonce"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
        />
        <altcha-widget challengeurl="/boletin/altcha" name="altcha" />
        <button type="submit" className="oc-btn oc-btn--primary" style={{ justifySelf: 'start' }}>
          Suscribirme
        </button>
      </form>
      <p style={{ fontSize: '0.8rem', marginTop: 12, marginBottom: 0 }}>
        Solo guardamos tu correo, en nuestro propio servidor, para enviarte el boletín. No rastreamos si abres
        los correos. Puedes darte de baja, descargar o borrar tus datos desde el enlace que va al pie de cada
        mensaje.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Use the form in the blog pages**

En `src/pages/Blog.jsx`:

- borra el estado `email` y `sent`, la función `handleSubmit` y el import de `useState`;
- reemplaza el bloque `<div className="oc-card">…</div>` de "Suscríbete al boletín" (con el formulario `mailto:` y su nota) por `<SuscripcionForm />`;
- agrega `import SuscripcionForm from '../components/SuscripcionForm';`.

En `src/pages/BlogPost.jsx`, dentro de la sección `oc-section--mist`, antes de `<h2 id="comentarios"`:

```jsx
<div style={{ marginBottom: 40 }}>
  <SuscripcionForm />
</div>
```

y agrega `import SuscripcionForm from '../components/SuscripcionForm';`.

- [ ] **Step 7: Lint, build and check in the local stack**

Run: `npm run lint && npm run build`
Expected: lint sin errores ni avisos nuevos; prerender con **14 rutas** (antes 13).

Run (reconstruye el sitio en la pila local y abre la página con Chrome sin interfaz):

```bash
C="docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml"
$C up -d --build web
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --ignore-certificate-errors \
  --user-data-dir="$TEMP/chrome-boletin" --virtual-time-budget=6000 --dump-dom https://localhost:58443/blog \
  | grep -oE 'action="/boletin/suscribir"|<altcha-widget[^>]*>'
```

Expected: imprime `action="/boletin/suscribir"` y la etiqueta `<altcha-widget …>`.

- [ ] **Step 8: Commit**

```bash
git add src scripts/prerender.mjs
git commit -m "Formulario de suscripción con ALTCHA y página única de confirmación"
```

---

### Task 6: Pruebas de extremo a extremo (puntos 1, 2 y 5 del spec)

**Files:**

- Create: `boletin/local/e2e.py`

**Interfaces:**

- Consumes: la pila local completa y configurada (tareas 2 a 5), con `BOLETIN_GLOBAL_LIMIT=3` y el token en `local.env`.
- Produces: `python boletin/local/e2e.py` termina con 0 si todos los casos pasan.

- [ ] **Step 1: Write the end-to-end tests**

`boletin/local/e2e.py`:

```python
"""Pruebas de extremo a extremo del boletín contra la pila local.

Uso: python boletin/local/e2e.py   (desde la raíz del repo, con la pila local
levantada y configurada; lee el token de boletin/local/local.env)
"""

import base64
import hashlib
import json
import os
import re
import ssl
import statistics
import subprocess
import sys
import time
import unittest
import urllib.error
import urllib.request
from urllib.parse import quote, urlencode

SITE = "https://localhost:58443"
PANEL = "https://boletin.localhost:58443"
LISTMONK = "http://127.0.0.1:59000"
MAILPIT = "http://127.0.0.1:58025"
CTX = ssl._create_unverified_context()
COMPOSE = ["docker", "compose", "--env-file", "boletin/local/local.env", "-f", "docker-compose.yml",
           "-f", "boletin/local/compose.local.yml"]


def env_value(key):
    with open("boletin/local/local.env", encoding="utf-8") as f:
        for line in f:
            if line.startswith(key + "="):
                return line.strip().split("=", 1)[1]
    return ""


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


OPENER = urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler(context=CTX))


def http(method, url, data=None, headers=None):
    headers = dict(headers or {})
    # Windows no resuelve *.localhost: se conecta a 127.0.0.1 y el nombre va en
    # la cabecera Host, que es lo que Traefik usa para enrutar.
    for name in ("boletin.localhost", "localhost"):
        prefix = f"https://{name}:58443"
        if url.startswith(prefix):
            headers.setdefault("Host", f"{name}:58443")
            url = "https://127.0.0.1:58443" + url[len(prefix):]
            break
    if isinstance(data, dict):
        data = urlencode(data).encode()
        headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        r = OPENER.open(req, timeout=30)
        return r.status, r.headers, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()


def solve_altcha():
    """Resuelve el reto ALTCHA como lo haría el navegador."""
    _, _, body = http("GET", f"{SITE}/boletin/altcha")
    ch = json.loads(body)
    for n in range(ch.get("maxnumber", 1_000_000) + 1):
        if hashlib.sha256(f"{ch['salt']}{n}".encode()).hexdigest() == ch["challenge"]:
            payload = {"algorithm": ch["algorithm"], "challenge": ch["challenge"], "number": n,
                       "salt": ch["salt"], "signature": ch["signature"]}
            return base64.b64encode(json.dumps(payload).encode()).decode()
    raise RuntimeError("no se pudo resolver el reto ALTCHA")


def subscribe(email, altcha=None):
    return http("POST", f"{SITE}/boletin/suscribir",
                {"email": email, "altcha": altcha if altcha is not None else solve_altcha()})


def mails_to(email, wait=2.0):
    time.sleep(wait)
    _, _, body = http("GET", f"{MAILPIT}/api/v1/search?query=" + quote(f"to:{email}"))
    return json.loads(body).get("messages", [])


def sql(query):
    return subprocess.run(COMPOSE + ["exec", "-T", "boletin-db", "psql", "-U", "listmonk", "-Atc", query],
                          capture_output=True, text=True, check=True).stdout.strip()


def restart_portero():
    """Vacía los contadores en memoria del portero entre grupos de pruebas."""
    subprocess.run(COMPOSE + ["restart", "boletin-portero"], check=True, capture_output=True)
    time.sleep(3)


class Suscripcion(unittest.TestCase):
    """Punto 1: suscripción y límite por destinatario."""

    def setUp(self):
        http("DELETE", f"{MAILPIT}/api/v1/messages")
        restart_portero()
        time.sleep(20)  # el límite por IP de Traefik recupera 1 envío cada 6 s

    def test_flujo_completo_suscribir_confirmar_baja(self):
        status, headers, _ = subscribe("flujo@ejemplo.org")
        self.assertEqual((status, headers["Location"]), (303, "/blog/suscripcion"))
        mails = mails_to("flujo@ejemplo.org")
        self.assertEqual(len(mails), 1)
        _, _, body = http("GET", f"{MAILPIT}/api/v1/message/{mails[0]['ID']}")
        link = re.search(r"https://boletin\.localhost:58443/subscription/optin/[^\s\"<]+",
                         json.loads(body)["Text"]).group(0)
        path, _, query = link.partition("?")
        http("POST", path.replace(PANEL, LISTMONK) + "?" + query, {"confirm": "true"})
        self.assertEqual(sql("select sl.status from subscriber_lists sl join subscribers s "
                             "on s.id = sl.subscriber_id join lists l on l.id = sl.list_id "
                             "where s.email = 'flujo@ejemplo.org' and l.name = 'Blog OpenCivic'"),
                         "confirmed")

    def test_cinco_envios_misma_direccion_un_solo_correo(self):
        for _ in range(5):
            subscribe("victima@ejemplo.org")
        self.assertEqual(len(mails_to("victima@ejemplo.org")), 1)

    def test_altcha_invalido_no_envia_ni_gasta_cupo(self):
        subscribe("cupo@ejemplo.org", altcha="aW52YWxpZG8=")
        self.assertEqual(len(mails_to("cupo@ejemplo.org")), 0)
        subscribe("cupo@ejemplo.org")
        self.assertEqual(len(mails_to("cupo@ejemplo.org")), 1)

    def test_limite_global(self):
        # local.env fija BOLETIN_GLOBAL_LIMIT=3 (en producción 20).
        for i in range(4):
            subscribe(f"global{i}@ejemplo.org")
        time.sleep(3)
        total = sum(len(mails_to(f"global{i}@ejemplo.org", wait=0)) for i in range(4))
        self.assertEqual(total, 3)


class Enumeracion(unittest.TestCase):
    """Punto 5: nadie puede saber desde fuera si un correo está en la lista."""

    def test_respuesta_identica_y_sin_diferencia_de_tiempo(self):
        restart_portero()
        sql("delete from subscribers where email like 'enum-%'")
        blog = sql("select id from lists where name = 'Blog OpenCivic'")
        for email, status in [("enum-confirmada@ejemplo.org", "confirmed"),
                              ("enum-pendiente@ejemplo.org", "unconfirmed"),
                              ("enum-baja@ejemplo.org", "unsubscribed")]:
            sid = sql(f"insert into subscribers (uuid, email, name, status) values "
                      f"(gen_random_uuid(), '{email}', 'x', 'enabled') returning id")
            sql(f"insert into subscriber_lists (subscriber_id, list_id, status) "
                f"values ({sid}, {blog}, '{status}')")
        sql("insert into subscribers (uuid, email, name, status) values "
            "(gen_random_uuid(), 'enum-bloqueada@ejemplo.org', 'x', 'blocklisted')")
        cases = ["enum-nueva@ejemplo.org", "enum-confirmada@ejemplo.org", "enum-pendiente@ejemplo.org",
                 "enum-baja@ejemplo.org", "enum-bloqueada@ejemplo.org", "no-es-un-correo"]
        seen, times = set(), {}
        for email in cases:
            altcha = solve_altcha()
            t0 = time.perf_counter()
            status, headers, body = subscribe(email, altcha)
            times[email] = (time.perf_counter() - t0) * 1000
            seen.add((status, headers.get("Location"), body))
            time.sleep(6.5)  # bajo el límite de 10/min por IP
        self.assertEqual(len(seen), 1, seen)
        self.assertLess(max(times.values()) - min(times.values()), 20, times)

    def test_endpoints_que_revelan_estado_bloqueados(self):
        for method, path, data in [("POST", "/api/public/subscription", b"{}"),
                                   ("POST", "/subscription/form", {"email": "a@b.org"})]:
            status, _, _ = http(method, PANEL + path, data)
            self.assertEqual(status, 403, path)


class TokenBorradores(unittest.TestCase):
    """Punto 2: el token de borradores no puede llegar a la lista."""

    @classmethod
    def setUpClass(cls):
        cls.auth = {"Authorization": "token " + env_value("BOLETIN_BORRADORES_TOKEN"),
                    "Content-Type": "application/json"}
        http("DELETE", f"{MAILPIT}/api/v1/messages")
        blog = sql("select id from lists where name = 'Blog OpenCivic'")
        sid = sql("insert into subscribers (uuid, email, name, status) values (gen_random_uuid(), "
                  "'lectora@ejemplo.org', 'x', 'enabled') on conflict (email) do update set name = 'x' "
                  "returning id")
        sql(f"insert into subscriber_lists (subscriber_id, list_id, status) values ({sid}, {blog}, "
            "'confirmed') on conflict do nothing")

    def api(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        status, _, raw = http(method, LISTMONK + path, data, self.auth)
        return status, json.loads(raw or b"{}")

    def campaign(self):
        rev = sql("select id from lists where name = 'Revisión'")
        tpl = sql("select id from templates where name = 'OpenCivic'")
        body = {"name": f"prueba-token-{time.time()}", "subject": "Prueba", "lists": [int(rev)],
                "type": "regular", "content_type": "html", "messenger": "email",
                "body": "<p>prueba</p>", "template_id": int(tpl)}
        status, out = self.api("POST", "/api/campaigns", body)
        self.assertEqual(status, 200, out)
        return out["data"]["id"], body

    def test_puede_crear_borrador(self):
        self.campaign()

    def test_no_puede_iniciar_ni_programar(self):
        cid, _ = self.campaign()
        for st in ("running", "scheduled"):
            status, _ = self.api("PUT", f"/api/campaigns/{cid}/status", {"status": st})
            self.assertEqual(status, 403, st)

    def test_prueba_solo_llega_a_revision(self):
        cid, body = self.campaign()
        status, _ = self.api("POST", f"/api/campaigns/{cid}/test", {**body, "subscribers": ["lectora@ejemplo.org"]})
        self.assertGreaterEqual(status, 400)
        self.assertEqual(len(mails_to("lectora@ejemplo.org")), 0)
        status, _ = self.api("POST", f"/api/campaigns/{cid}/test",
                             {**body, "subscribers": ["info@opencivicsolutions.org"]})
        self.assertEqual(status, 200)

    def test_no_puede_leer_suscriptores(self):
        status, _ = self.api("GET", "/api/subscribers")
        self.assertEqual(status, 403)

    def test_token_inutil_desde_fuera(self):
        status, _, _ = http("GET", f"{PANEL}/api/campaigns", headers=self.auth)
        self.assertEqual(status, 403)


class LimitesPorIP(unittest.TestCase):
    """Se ejecuta al final: agota los límites por IP de Traefik."""

    def test_suscribir_429_al_undecimo(self):
        time.sleep(61)
        codes = [http("POST", f"{SITE}/boletin/suscribir", {"email": f"rl{i}@ejemplo.org"})[0]
                 for i in range(11)]
        self.assertEqual(codes[:10], [303] * 10)
        self.assertEqual(codes[10], 429)

    def test_login_429_al_sexto(self):
        codes = [http("POST", f"{PANEL}/admin/login", {"username": "x", "password": "y"})[0]
                 for _ in range(6)]
        self.assertNotIn(429, codes[:5])
        self.assertEqual(codes[5], 429)


if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
    suite = unittest.TestSuite()
    loader = unittest.defaultTestLoader
    for case in (Suscripcion, Enumeracion, TokenBorradores, LimitesPorIP):
        suite.addTests(loader.loadTestsFromTestCase(case))
    sys.exit(0 if unittest.TextTestRunner(verbosity=2).run(suite).wasSuccessful() else 1)
```

- [ ] **Step 2: Run the end-to-end tests**

Run: `python boletin/local/e2e.py`
Expected: `Ran 14 tests` … `OK` (tarda unos 3 minutos por las pausas de los límites por IP).

Si algún caso falla, **no** cambies el umbral de la prueba. Arregla el componente que la tarea correspondiente construyó y vuelve a ejecutar.

Si el formato del reto ALTCHA de Listmonk 6.2 no es el que `solve_altcha` espera, imprime `json.loads(body)` del reto y adapta solo `solve_altcha`.

- [ ] **Step 3: Commit**

```bash
git add boletin/local/e2e.py
git commit -m "Pruebas de extremo a extremo del boletín: límites, enumeración y token de borradores"
```

---

### Task 7: Copias de seguridad cifradas

**Files:**

- Create: `boletin/respaldo/subir_b2.py`
- Create: `boletin/respaldo/test_subir_b2.py`
- Create: `boletin/respaldo/respaldo.sh`

**Interfaces:**

- Consumes: el contenedor `opencivic-boletin-db` y el binario `age` en el VPS. Variables de `/etc/opencivic-respaldo.env`: `B2_KEY_ID`, `B2_APP_KEY` y `B2_BUCKET_ID`.
- Produces:
  - `python subir_b2.py <archivo>` sube el archivo con su nombre. Usa solo `b2_authorize_account`, `b2_get_upload_url` y `b2_upload_file`, así que funciona con una llave de **solo escritura**.
  - `respaldo.sh` lo ejecuta cron a diario.

- [ ] **Step 1: Write the failing tests**

`boletin/respaldo/test_subir_b2.py`:

```python
import hashlib
import http.server
import json
import tempfile
import threading
import unittest

import subir_b2


class FakeB2:
    def __init__(self):
        self.uploads = []
        b2 = self

        class H(http.server.BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _json(self, data):
                body = json.dumps(data).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self):
                assert self.path == "/b2api/v3/b2_authorize_account"
                self._json({"authorizationToken": "tok", "apiInfo": {"storageApi": {"apiUrl": b2.url}}})

            def do_POST(self):
                body = self.rfile.read(int(self.headers["Content-Length"]))
                if self.path == "/b2api/v3/b2_get_upload_url":
                    assert json.loads(body)["bucketId"] == "bucket1"
                    return self._json({"uploadUrl": b2.url + "/upload", "authorizationToken": "up"})
                b2.uploads.append({"name": self.headers["X-Bz-File-Name"],
                                   "sha1": self.headers["X-Bz-Content-Sha1"], "body": body})
                self._json({"fileId": "f1"})

        self.httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.httpd.server_port}"


class SubirTest(unittest.TestCase):
    def test_sube_con_nombre_y_sha1(self):
        b2 = FakeB2()
        with tempfile.NamedTemporaryFile(suffix=".sql.gz.age", delete=False) as f:
            f.write(b"contenido cifrado")
        subir_b2.upload(f.name, "keyid", "appkey", "bucket1", api_base=b2.url)
        up = b2.uploads[0]
        self.assertTrue(up["name"].endswith(".sql.gz.age"))
        self.assertEqual(up["sha1"], hashlib.sha1(b"contenido cifrado").hexdigest())
        self.assertEqual(up["body"], b"contenido cifrado")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin/respaldo:/app" -w /app python:3.13-alpine python -m unittest -v test_subir_b2`
Expected: FAIL con `ModuleNotFoundError: No module named 'subir_b2'`.

- [ ] **Step 3: Write the uploader and the backup script**

`boletin/respaldo/subir_b2.py`:

```python
"""Sube un archivo a Backblaze B2 con la API nativa v3.

Solo usa operaciones de escritura, así funciona con una llave limitada al
bucket y sin permisos de leer ni borrar: un intruso en el VPS no puede tocar
las copias anteriores.
"""

import base64
import hashlib
import json
import os
import sys
import urllib.request
from urllib.parse import quote


def _json(req):
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def upload(path, key_id, app_key, bucket_id, api_base="https://api.backblazeb2.com"):
    basic = base64.b64encode(f"{key_id}:{app_key}".encode()).decode()
    auth = _json(urllib.request.Request(f"{api_base}/b2api/v3/b2_authorize_account",
                                        headers={"Authorization": f"Basic {basic}"}))
    api_url = auth["apiInfo"]["storageApi"]["apiUrl"]
    up = _json(urllib.request.Request(
        f"{api_url}/b2api/v3/b2_get_upload_url", data=json.dumps({"bucketId": bucket_id}).encode(),
        headers={"Authorization": auth["authorizationToken"], "Content-Type": "application/json"}))
    with open(path, "rb") as f:
        data = f.read()
    _json(urllib.request.Request(up["uploadUrl"], data=data, headers={
        "Authorization": up["authorizationToken"],
        "X-Bz-File-Name": quote(os.path.basename(path)),
        "Content-Type": "application/octet-stream",
        "X-Bz-Content-Sha1": hashlib.sha1(data).hexdigest(),
    }))


if __name__ == "__main__":
    upload(sys.argv[1], os.environ["B2_KEY_ID"], os.environ["B2_APP_KEY"], os.environ["B2_BUCKET_ID"])
    print("subido:", os.path.basename(sys.argv[1]))
```

`boletin/respaldo/respaldo.sh`:

```sh
#!/bin/sh
# Copia diaria de la base del boletín (cron del VPS, como root):
#   15 3 * * * /docker/hrp-dashboard/boletin/respaldo/respaldo.sh >> /var/log/opencivic-respaldo.log 2>&1
# Cifra con la clave PÚBLICA de Carlos: el VPS puede crear copias pero no leerlas.
set -eu
REPO=/docker/hrp-dashboard
DIR=/var/backups/opencivic-boletin
. /etc/opencivic-respaldo.env
mkdir -p "$DIR"
chmod 700 "$DIR"
FILE="$DIR/listmonk-$(date -u +%Y-%m-%dT%H%MZ).sql.gz.age"
docker exec opencivic-boletin-db pg_dump -U listmonk --no-owner listmonk \
  | gzip -9 \
  | age -R "$REPO/boletin/respaldo/age-recipient.txt" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'listmonk-*.sql.gz.age' -mtime +14 -delete
docker run --rm -v "$DIR:/datos:ro" -v "$REPO/boletin/respaldo:/app:ro" \
  -e B2_KEY_ID -e B2_APP_KEY -e B2_BUCKET_ID python:3.13-alpine \
  python /app/subir_b2.py "/datos/$(basename "$FILE")"
echo "$(date -u +%FT%TZ) respaldo ok: $(basename "$FILE")"
```

Para que `docker run -e` reciba las variables, `/etc/opencivic-respaldo.env` las define con `export`. Lo crea la tarea 9.

- [ ] **Step 4: Run tests to verify they pass**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/boletin/respaldo:/app" -w /app python:3.13-alpine python -m unittest -v test_subir_b2`
Expected: `Ran 1 test` … `OK`.

- [ ] **Step 5: Test the encrypt-and-restore pipeline locally with a throwaway key**

```bash
C="docker compose --env-file boletin/local/local.env -f docker-compose.yml -f boletin/local/compose.local.yml"
docker run --rm -v "$TEMP:/k" alpine:3.20 sh -c "apk add -q age && age-keygen -o /k/clave-prueba.txt 2>/dev/null && age-keygen -y /k/clave-prueba.txt > /k/pub-prueba.txt"
$C exec -T boletin-db pg_dump -U listmonk --no-owner listmonk | gzip -9 > "$TEMP/dump.sql.gz"
docker run --rm -v "$TEMP:/k" alpine:3.20 sh -c "apk add -q age && age -R /k/pub-prueba.txt /k/dump.sql.gz > /k/dump.sql.gz.age && age -d -i /k/clave-prueba.txt /k/dump.sql.gz.age | gunzip | grep -c 'CREATE TABLE'"
rm -f "$TEMP"/clave-prueba.txt "$TEMP"/pub-prueba.txt "$TEMP"/dump.sql.gz*
```

Expected: un número mayor que 10 (las tablas de Listmonk sobreviven al ciclo de cifrar y descifrar).

- [ ] **Step 6: Commit**

```bash
git add boletin/respaldo
git commit -m "Copias del boletín cifradas con age y subida de solo escritura a Backblaze B2"
```

---

### Task 8: Despliegue con creación de borradores

**Files:**

- Create: `deploy/opencivic-deploy.sh`
- Modify: `.github/workflows/deploy.yml` (comprobación de salud del boletín)

**Interfaces:**

- Consumes: `borrador.py` (tarea 4), servicio `boletin-herramientas` (tarea 2).
- Produces: el comando forzado del VPS (`/usr/local/bin/opencivic-deploy.sh`), versionado en el repo e instalado a mano (tarea 9). Para un artículo nuevo, el log de GitHub Actions muestra `borrador articulo:<slug>: creado`.

- [ ] **Step 1: Write the deploy script**

`deploy/opencivic-deploy.sh`:

```sh
#!/bin/sh
# Comando forzado de la llave de despliegue (authorized_keys del VPS):
#   restrict,command="/usr/local/bin/opencivic-deploy.sh" ssh-ed25519 …
# Se instala a mano desde el repo; un "git pull" no lo reemplaza solo.
set -eu
exec 9>/var/lock/opencivic-deploy.lock
flock 9
cd /docker/hrp-dashboard
antes=$(git rev-parse HEAD)
git pull --ff-only --quiet origin master
despues=$(git rev-parse HEAD)
docker compose up -d --build
docker image prune -f >/dev/null

# Un borrador por cada artículo nuevo (spec del boletín, punto 2). Un fallo
# aquí no tumba el despliegue: el sitio ya está publicado.
if [ "$antes" != "$despues" ]; then
  git diff --name-only --diff-filter=A "$antes" "$despues" -- src/content/posts/ \
    | while read -r archivo; do
        docker compose run --rm -T boletin-herramientas python borrador.py "/posts/$(basename "$archivo")" \
          || echo "aviso: no se pudo crear el borrador de $archivo" >&2
      done
fi
echo "desplegado $despues"
```

- [ ] **Step 2: Check the script syntax**

Run: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD:/r:ro" koalaman/shellcheck:stable -S warning /r/deploy/opencivic-deploy.sh /r/boletin/respaldo/respaldo.sh`
Expected: sin salida y código 0.

- [ ] **Step 3: Add the newsletter health check to CI**

En `.github/workflows/deploy.yml`, en el paso "Comprobar que el sitio responde", cambia la lista de rutas por URLs completas:

```yaml
for url in https://opencivicsolutions.org/ https://opencivicsolutions.org/blog \
https://opencivicsolutions.org/sitemap.xml https://opencivicsolutions.org/comentarios/ping \
https://boletin.opencivicsolutions.org/health; do
for attempt in $(seq 1 18); do
code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
[ "$code" = 200 ] && break
sleep 5
done
echo "$url -> $code"
[ "$code" = 200 ]
done
```

- [ ] **Step 4: Simulate the post-diff locally**

```bash
git diff --name-only --diff-filter=A "$(git rev-list --max-parents=0 HEAD)" HEAD -- src/content/posts/
```

Expected: los 6 artículos actuales (`src/content/posts/01-…md` a `06-…md`), uno por línea, que es lo que el script recorrería.

- [ ] **Step 5: Commit**

```bash
git add deploy/opencivic-deploy.sh .github/workflows/deploy.yml
git commit -m "Despliegue: borrador por artículo nuevo y salud del boletín en CI"
```

---

### Task 9: Puesta en producción (guiada, con Carlos)

**Files:**

- Create: `boletin/respaldo/age-recipient.txt` (clave pública de Carlos)
- Servidor: `/docker/hrp-dashboard/.env`, `/etc/opencivic-respaldo.env`, `/usr/local/bin/opencivic-deploy.sh` y el cron de root

**Interfaces:**

- Consumes: todo lo anterior, en un PR que Carlos aprueba.
- Produces: el boletín funcionando en producción.

**Orden obligatorio:** los pasos 1 a 5 van **antes** de fusionar el PR. `docker-compose.yml` exige `BOLETIN_DB_PASSWORD`, `BOLETIN_ADMIN_USER` y `BOLETIN_ADMIN_PASSWORD`. Si el `.env` del VPS no las tiene cuando el merge dispara el despliegue automático, `docker compose up` falla y **el sitio entero se queda sin actualizar**. Además, sin el DNS de `boletin.` la nueva comprobación de salud de CI fallaría.

Pasos de **Carlos** (los guía quien ejecuta el plan, uno por uno):

- [ ] **Step 1: Carlos crea el buzón y anota el vencimiento**

En hPanel → Correos → Crear buzón `boletin@opencivicsolutions.org`. Anota en el spec (sección "Preguntas abiertas") la **fecha exacta de vencimiento** de la prueba.

- [ ] **Step 2: Carlos agrega dos registros DNS en Hostinger**

- `A`, nombre `boletin`, valor `179.236.66.237`.
- Edita el TXT `_dmarc`: `v=DMARC1; p=none; rua=mailto:info@opencivicsolutions.org`.

Verificación: `nslookup boletin.opencivicsolutions.org 8.8.8.8` → `179.236.66.237`.

- [ ] **Step 3: Carlos genera su par de claves `age` en su PC**

En PowerShell:

```powershell
winget install --id FiloSottile.age -e
age-keygen -o "$env:USERPROFILE\Desktop\clave-respaldo-boletin.txt"
```

Carlos:

1. Copia **todo** el contenido del archivo a una nota segura de su gestor de contraseñas.
2. Copia solo la línea `# public key: age1…` al chat. Es la clave pública, no es secreta.
3. Borra el archivo del escritorio.

Quien ejecuta el plan guarda la clave pública en `boletin/respaldo/age-recipient.txt` y hace commit.

- [ ] **Step 4: Carlos crea el bucket y la llave en Backblaze B2**

1. Crear cuenta en backblaze.com (plan B2).
2. Crear bucket **privado** `opencivic-boletin-respaldos`.
3. En su configuración de ciclo de vida, poner **ocultar a los 90 días** y **borrar 1 día después**.
4. En "Application Keys", crear una llave con acceso **solo a ese bucket** y tipo **Write Only**.
5. Pasar por el chat `keyID`, `applicationKey` y el `bucketId`. Es una llave que solo puede agregar archivos: no puede leer ni borrar.

Pasos de **quien ejecuta el plan**, por SSH en el VPS, con el acceso de las sesiones anteriores:

- [ ] **Step 5: Comprobar la versión de Traefik y preparar `.env`**

```bash
docker ps --format '{{.Image}}' | grep -i traefik
cd /docker/hrp-dashboard && cp .env .env.respaldo-$(date +%F)
cat >> .env <<EOF
BOLETIN_DB_PASSWORD=$(openssl rand -hex 24)
BOLETIN_ADMIN_USER=carlos
BOLETIN_ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
EOF
chmod 600 .env
```

Expected: la imagen es `traefik:v3.x`. Si es v2, **detente**: las reglas usan `HeaderRegexp` e `ipallowlist` de v3, y antes de seguir hay que cambiar a `HeadersRegexp` e `ipwhitelist`.

- [ ] **Step 6: Carlos fusiona el PR; luego se configura y se guarda el token**

Carlos fusiona el PR. El despliegue automático levanta los servicios nuevos y su comprobación de salud debe quedar en verde, incluida `https://boletin.opencivicsolutions.org/health`. Después, en el VPS:

```bash
cd /docker/hrp-dashboard
docker compose run --rm boletin-herramientas python configurar.py | tee /root/configurar-boletin.txt
grep BOLETIN_BORRADORES_TOKEN /root/configurar-boletin.txt >> .env && shred -u /root/configurar-boletin.txt
grep BOLETIN_ADMIN_PASSWORD .env
```

Se muestra a Carlos la contraseña del panel **una sola vez**, y Carlos la guarda en su gestor de contraseñas.

- [ ] **Step 7: Carlos termina la configuración en el panel**

En `https://boletin.opencivicsolutions.org/admin`, con el usuario `carlos`:

1. Ajustes → SMTP → servidor `smtp.hostinger.com` → escribe la **contraseña del buzón** `boletin@` → Guardar → "Probar conexión" hacia `info@`.
2. Perfil → **activar el doble factor (TOTP)** con la app del teléfono.
3. Perfil → cambiar la contraseña por una nueva del gestor.

Verificación: cerrar sesión y entrar de nuevo; debe pedir el código de 6 dígitos.

- [ ] **Step 8: Instalar el script de despliegue, las copias y el cron**

```bash
install -m 755 /docker/hrp-dashboard/deploy/opencivic-deploy.sh /usr/local/bin/opencivic-deploy.sh
apt-get install -y age
cat > /etc/opencivic-respaldo.env <<'EOF'
export B2_KEY_ID=<keyID de Carlos>
export B2_APP_KEY=<applicationKey de Carlos>
export B2_BUCKET_ID=<bucketId de Carlos>
EOF
chmod 600 /etc/opencivic-respaldo.env
chmod 755 /docker/hrp-dashboard/boletin/respaldo/respaldo.sh
/docker/hrp-dashboard/boletin/respaldo/respaldo.sh
( crontab -l 2>/dev/null; echo "15 3 * * * /docker/hrp-dashboard/boletin/respaldo/respaldo.sh >> /var/log/opencivic-respaldo.log 2>&1" ) | crontab -
```

Expected: `respaldo ok: listmonk-….sql.gz.age` y `subido: listmonk-…`. En la web de B2 aparece el archivo.

- [ ] **Step 9: Verificación en producción**

```bash
for p in /api/public/subscription; do curl -s -o /dev/null -w "$p %{http_code}\n" -X POST -d '{}' https://boletin.opencivicsolutions.org$p; done
curl -s -o /dev/null -w "form %{http_code}\n" -X POST -d 'email=a@b.org' https://boletin.opencivicsolutions.org/subscription/form
curl -s -o /dev/null -w "token %{http_code}\n" -H "Authorization: token borradores:x" https://boletin.opencivicsolutions.org/api/campaigns
curl -s -o /dev/null -w "basic %{http_code}\n" -H "Authorization: Basic Ym9ycmFkb3Jlczp4" https://boletin.opencivicsolutions.org/api/campaigns
curl -s -o /dev/null -w "sin-espacio %{http_code}\n" -H "Authorization: tokenborradores:x" https://boletin.opencivicsolutions.org/api/campaigns
curl -s -o /dev/null -w "portero %{http_code}\n" -X POST -d 'email=a@b.org' https://opencivicsolutions.org/boletin/suscribir
```

Expected: `403`, `403`, `403`, `403`, `403` y `303`.

Luego:

1. **Carlos** se suscribe desde `https://opencivicsolutions.org/blog` con su propio correo. Confirma que el mensaje llega, que **no** cae en spam y que el enlace lo deja suscrito.
2. **Carlos** descifra en su PC la copia de B2 con su clave privada, como prueba de restauración:

   ```powershell
   age -d -i clave.txt listmonk-….sql.gz.age > dump.sql.gz
   ```

   (`clave.txt` se crea temporalmente desde la nota del gestor y se borra después).

3. Se repite la medición de tiempos de la clase `Enumeracion` contra producción con 3 correos (nuevo, confirmado de Carlos e inválido). La diferencia de medianas debe ser **menor a 20 ms**.

- [ ] **Step 10: Commit**

```bash
git add boletin/respaldo/age-recipient.txt docs/superpowers/specs/2026-10-11-suscripcion-boletin-design.md
git commit -m "Boletín en producción: clave pública de las copias y fecha de vencimiento del correo"
```
