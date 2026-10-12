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
