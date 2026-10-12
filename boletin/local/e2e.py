"""Pruebas de extremo a extremo del boletín contra la pila local.

Uso: python boletin/local/e2e.py   (desde la raíz del repo, con la pila local
levantada y configurada; lee el token de boletin/local/.token.env)
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
COMPOSE = ["docker", "compose", "--env-file", "boletin/local/local.env", "--env-file",
           "boletin/local/.token.env", "-f", "docker-compose.yml", "-f", "boletin/local/compose.local.yml"]


def env_value(key):
    # El token local vive en .token.env (ignorado por git), no en local.env.
    for name in ("boletin/local/.token.env", "boletin/local/local.env"):
        if not os.path.exists(name):
            continue
        with open(name, encoding="utf-8") as f:
            for line in f:
                if line.startswith(key + "=") and line.strip() != key + "=":
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
    return subprocess.run(COMPOSE + ["exec", "-T", "boletin-db", "psql", "-U", "listmonk", "-qAtc", query],
                          capture_output=True, text=True, check=True).stdout.strip()


def restart_portero():
    """Vacía los contadores en memoria del portero entre grupos de pruebas.

    Espera a que su comprobación de salud pase: mientras tanto Traefik lo saca
    de servicio y la petición caería en el sitio (404).
    """
    subprocess.run(COMPOSE + ["restart", "boletin-portero"], check=True, capture_output=True)
    for _ in range(60):
        state = subprocess.run(["docker", "inspect", "-f", "{{.State.Health.Status}}",
                                "opencivic-boletin-portero"], capture_output=True, text=True).stdout.strip()
        if state == "healthy":
            break
        time.sleep(1)
    else:
        raise RuntimeError("el portero no quedó sano tras reiniciarlo")
    time.sleep(2)  # Traefik vuelve a registrar la ruta


def setUpModule():
    """Cada ejecución empieza limpia: sin suscriptores de prueba ni correos."""
    sql("delete from subscribers where email like '%@ejemplo.org'")
    http("DELETE", f"{MAILPIT}/api/v1/messages")


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
        # Listmonk acepta el token como "token u:t", "tokenu:t" y "Basic base64(u:t)":
        # Traefik debe rechazar cualquier /api con cabecera Authorization.
        token = env_value("BOLETIN_BORRADORES_TOKEN")
        basic = base64.b64encode(token.encode()).decode()
        for value in (f"token {token}", f"token{token}", f"TOKEN {token}", f"Basic {basic}"):
            status, _, _ = http("GET", f"{PANEL}/api/campaigns", headers={"Authorization": value})
            self.assertEqual(status, 403, value.split(" ")[0])


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
