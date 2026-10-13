"""Crea el borrador de campaña de un artículo nuevo y envía la vista previa.

Lo ejecuta el script de despliegue del VPS por cada artículo agregado:
  docker compose run --rm -T boletin-herramientas python borrador.py /posts/NN-slug.md

El token es de un usuario de API que no puede enviar campañas ni ver a los
suscriptores del blog: el borrador va a la lista "Revisión" y solo Carlos,
desde el panel, la cambia a "Blog OpenCivic" y la envía.
"""

import html
import os
import re
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


def escape_template(text: str) -> str:
    """Listmonk compila asunto y cuerpo como plantillas Go: "{{" y "}}" del
    artículo se escriben como texto literal para no romper la plantilla."""
    return re.sub(r"\{\{|\}\}", lambda m: '{{"' + m.group(0) + '"}}', text)


def esc(text: str) -> str:
    """Escape HTML y de plantilla, para texto del artículo dentro del cuerpo."""
    return escape_template(html.escape(text))


def build_html(meta: dict, site_url: str) -> str:
    url = f"{site_url}/blog/{quote(meta['slug'])}"
    # Gmail y Outlook no muestran SVG: se usa la imagen para redes (PNG) y, si
    # no hay, la ilustración solo cuando no es SVG.
    image = next((x for x in (meta.get("ogImage"), meta.get("image"))
                  if x and not x.lower().endswith(".svg")), None)
    img = ""
    if image:
        src = image if image.startswith("http") else site_url + image
        img = (f'<p><img src="{html.escape(src)}" alt="{esc(meta.get("imageAlt", ""))}" '
               'width="544" style="width:100%;height:auto;border-radius:8px;" /></p>')
    return (
        f'<h1 style="color:#0A3880;font-size:24px;line-height:1.3;">{esc(meta["title"])}</h1>'
        f"{img}"
        f'<p style="font-size:17px;">{esc(meta["dek"])}</p>'
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
    # Sin "query": Listmonk lo pasa a la búsqueda de texto de PostgreSQL y el
    # ":" del nombre rompe su sintaxis. Las campañas son pocas; se filtra aquí.
    found = lm.get("/api/campaigns?per_page=all")
    if _find(found, name):
        return "ya existe"
    review = _find(lm.get("/api/lists?per_page=all&minimal=true"), REVIEW_LIST)
    template = _find(lm.get("/api/templates"), TEMPLATE_NAME)
    if review is None or template is None:
        raise RuntimeError("faltan la lista Revisión o la plantilla: ejecuta configurar.py")
    campaign = {
        "name": name,
        "subject": escape_template(meta["title"]),
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
