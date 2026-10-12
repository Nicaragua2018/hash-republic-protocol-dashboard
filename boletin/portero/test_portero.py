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
        self.lim = portero.Limiter(global_limit=3, window=86400, clock=self.clock, max_wait=0.2)

    def accept(self, email):
        ok = self.lim.try_reserve(email)
        if ok:
            self.lim.commit(email)
        return ok

    def test_una_por_direccion_cada_24h(self):
        self.assertTrue(self.accept("ana@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("ana@ejemplo.org"))
        self.clock.now += 86401
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))

    def test_limite_global(self):
        for i in range(3):
            self.assertTrue(self.accept(f"p{i}@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("otra@ejemplo.org"))
        self.clock.now += 86401
        self.assertTrue(self.lim.try_reserve("otra@ejemplo.org"))

    def test_release_devuelve_el_cupo(self):
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))
        self.lim.release("ana@ejemplo.org")
        self.assertTrue(self.lim.try_reserve("ana@ejemplo.org"))
        self.lim.commit("ana@ejemplo.org")
        for i in range(2):
            self.assertTrue(self.accept(f"p{i}@ejemplo.org"))
        self.assertFalse(self.lim.try_reserve("x@ejemplo.org"))

    def _in_thread(self, email):
        out = {}
        t = threading.Thread(target=lambda: out.setdefault("ok", self.lim.try_reserve(email)))
        t.start()
        return t, out

    def test_en_vuelo_espera_y_no_se_pierde_si_se_libera(self):
        lim = portero.Limiter(global_limit=3, clock=self.clock, max_wait=5)
        self.lim = lim
        self.assertTrue(lim.try_reserve("ana@ejemplo.org"))  # un bot, en vuelo
        t, out = self._in_thread("ana@ejemplo.org")         # la persona real
        time.sleep(0.2)
        self.assertTrue(t.is_alive(), "debe esperar, no descartarse")
        lim.release("ana@ejemplo.org")                       # Listmonk rechazó al bot
        t.join(2)
        self.assertTrue(out["ok"])

    def test_en_vuelo_aceptada_bloquea_la_espera(self):
        lim = portero.Limiter(global_limit=3, clock=self.clock, max_wait=5)
        self.lim = lim
        lim.try_reserve("ana@ejemplo.org")
        t, out = self._in_thread("ana@ejemplo.org")
        time.sleep(0.2)
        lim.commit("ana@ejemplo.org")
        t.join(2)
        self.assertFalse(out["ok"])

    def test_cupo_global_ocupado_por_vuelos_espera(self):
        lim = portero.Limiter(global_limit=1, clock=self.clock, max_wait=5)
        self.lim = lim
        lim.try_reserve("bot@ejemplo.org")
        t, out = self._in_thread("ana@ejemplo.org")
        time.sleep(0.2)
        self.assertTrue(t.is_alive())
        lim.release("bot@ejemplo.org")
        t.join(2)
        self.assertTrue(out["ok"])

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

    def __init__(self, status=200, delay=0.0, statuses=None):
        self.status, self.delay, self.received = status, delay, []
        self.statuses = list(statuses or [])
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
                fake.received.append(fields)
                status = fake.statuses.pop(0) if fake.statuses else fake.status
                time.sleep(fake.delay)
                self.send_response(status)
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
    def start(self, fake, global_limit=20, forward_timeout=20.0):
        cfg = portero.Config(listmonk_url=fake.url, list_name="Blog OpenCivic",
                             redirect="/blog/suscripcion",
                             limiter=portero.Limiter(global_limit=global_limit),
                             forward_timeout=forward_timeout)
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

    def test_peticion_real_no_se_pierde_por_un_bot_en_vuelo(self):
        fake = FakeListmonk(delay=0.5, statuses=[400, 200])  # bot rechazado, persona aceptada
        url = self.start(fake)
        post(url, {"email": "ana@ejemplo.org", "altcha": "falso"})
        time.sleep(0.1)
        post(url, {"email": "ana@ejemplo.org", "altcha": "bueno"})
        self.assertTrue(self.wait_for(lambda: len(fake.received) == 2, timeout=4))
        self.assertEqual(fake.received[1]["altcha"], ["bueno"])

    def test_tiempo_agotado_cuenta_como_aceptado(self):
        # Si Listmonk responde tarde, quizá ya envió la confirmación: no se libera.
        fake = FakeListmonk(delay=1.0)
        url = self.start(fake, forward_timeout=0.3)
        post(url, {"email": "ana@ejemplo.org", "altcha": "x"})
        time.sleep(1.5)
        post(url, {"email": "ana@ejemplo.org", "altcha": "x"})
        time.sleep(1.5)
        self.assertEqual(len(fake.received), 1)

    def test_listmonk_caido_no_gasta_cupo(self):
        fake = FakeListmonk()
        url = self.start(fake)
        fake.httpd.shutdown()
        fake.httpd.server_close()
        status, loc, _ = post(url, {"email": "ana@ejemplo.org", "altcha": "x"})
        self.assertEqual((status, loc), (303, "/blog/suscripcion"))
        time.sleep(0.5)
        lim = self.httpd.cfg.limiter
        lim.max_wait = 0.2
        self.assertTrue(lim.try_reserve("ana@ejemplo.org"))

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
