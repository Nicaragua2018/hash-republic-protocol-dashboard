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
