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


class ImagenesCorreoTest(unittest.TestCase):
    """Gmail y Outlook no muestran SVG: en el correo solo van PNG o JPG."""

    def test_usa_og_image_png_en_vez_de_svg(self):
        meta = {"slug": "a", "title": "T", "dek": "D", "image": "/ilustracion.svg", "ogImage": "/og-a.png"}
        html = borrador.build_html(meta, "https://opencivicsolutions.org")
        self.assertIn('src="https://opencivicsolutions.org/og-a.png"', html)
        self.assertNotIn(".svg", html)

    def test_solo_svg_sin_og_image_no_pone_imagen(self):
        meta = {"slug": "a", "title": "T", "dek": "D", "image": "/ilustracion.svg"}
        self.assertNotIn("<img", borrador.build_html(meta, "https://opencivicsolutions.org"))

    def test_plantilla_sin_svg(self):
        import os
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plantilla-correo.html"),
                  encoding="utf-8") as f:
            self.assertNotIn(".svg", f.read())


class LlavesDePlantillaTest(unittest.TestCase):
    """Listmonk compila asunto y cuerpo como plantillas Go: "{{" debe salir literal."""

    def test_escapa_llaves(self):
        self.assertEqual(borrador.escape_template("a {{ b }} c"), 'a {{"{{"}} b {{"}}"}} c')
        self.assertEqual(borrador.escape_template("sin llaves"), "sin llaves")

    def test_html_escapa_llaves_del_titulo_y_resumen(self):
        meta = {"slug": "a", "title": "Uso de {{ plantillas }}", "dek": "y }} sueltas"}
        html = borrador.build_html(meta, "https://opencivicsolutions.org")
        self.assertNotIn("{{ plantillas", html)
        self.assertIn('{{"{{"}}', html)


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
                    # Como Listmonk 6.2: "query" va a la búsqueda de texto de
                    # PostgreSQL y un ":" en el término da error 500.
                    if "query=" in self.path and "%3A" in self.path.split("query=")[1].split("&")[0]:
                        return self._send(500, "pq: syntax error in tsquery")
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
