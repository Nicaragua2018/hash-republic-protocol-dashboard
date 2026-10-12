"""Deja Listmonk configurado como dice el spec. Se puede ejecutar varias veces.

Uso (dentro de la red de Docker):
  docker compose run --rm boletin-herramientas python configurar.py [--rotar-token]

Necesita BOLETIN_ADMIN_USER y BOLETIN_ADMIN_PASSWORD. Se usa durante la
instalación, antes de que Carlos active el doble factor.
"""

import os
import sys
import time
from urllib.parse import quote

from lmapi import Client, ListmonkError

BLOG_LIST = "Blog OpenCivic"
REVIEW_LIST = "Revisión"
REVIEW_EMAIL = "info@opencivicsolutions.org"
TEMPLATE_NAME = "OpenCivic"
API_USER = "borradores"
USER_ROLE = "borradores"
LIST_ROLE = "solo-revision"


# El plan de correo de Hostinger solo permite un buzón: el boletín sale del
# que ya existe. Se cambia con BOLETIN_REMITENTE si algún día hay otro.
REMITENTE = os.environ.get("BOLETIN_REMITENTE", "info@opencivicsolutions.org")


def smtp_entry(current: list[dict], local: bool, sender: str = REMITENTE) -> dict:
    """La única entrada SMTP: Hostinger o, en la pila local, Mailpit.

    La contraseña NO va aquí: Carlos la escribe en el panel. Con password vacío
    y el mismo uuid, Listmonk conserva la existente. Se parte de una entrada
    que ya existe para no perder campos que Listmonk exige (msg_retry_delay en
    la 6.2): sin ellos no puede leer su configuración y no arranca.
    """
    if local:
        server = {"host": "mailpit", "port": 1025, "auth_protocol": "none", "username": "",
                  "tls_type": "none", "tls_skip_verify": True}
    else:
        server = {"host": "smtp.hostinger.com", "port": 465, "auth_protocol": "login",
                  "username": sender, "tls_type": "TLS", "tls_skip_verify": False}
    same = [x for x in current if x.get("host") == server["host"]]
    if same:
        base = same[0]
    else:
        # Entrada nueva: hereda los campos de otra pero no su identidad.
        base = {k: v for k, v in (current[0] if current else {}).items() if k not in ("uuid", "name")}
    return {
        "msg_retry_delay": "5s",
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
    }


def configure_settings(lm: Client, root_url: str) -> None:
    s = lm.get("/api/settings")
    s.update({
        "app.root_url": root_url,
        "app.lang": "es",
        "app.from_email": f"OpenCivic Solutions <{REMITENTE}>",
        "app.notify_emails": [REVIEW_EMAIL],
        "app.enable_public_subscription_page": True,
        "app.send_optin_confirmation": True,
        "app.message_sliding_window": True,
        "app.message_sliding_window_duration": "24h",
        "app.message_sliding_window_rate": 800,
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
    s["smtp"] = [smtp_entry(s.get("smtp", []), local=os.environ.get("BOLETIN_SMTP") == "mailpit")]
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


SAMPLE_LISTS = ("Default list", "Opt-in list")


def sample_lists_to_delete(lists: list[dict]) -> list[int]:
    """Listas de ejemplo que Listmonk crea al instalarse, solo si están vacías."""
    return [x["id"] for x in lists if x["name"] in SAMPLE_LISTS and not x.get("subscriber_count")]


# Las dos personas de ejemplo que Listmonk crea al instalarse.
SAMPLE_SUBSCRIBERS = {("john@example.com", "John Doe"), ("anon@example.com", "Anon Doe")}


def sample_subscriber_ids(subs: list[dict]) -> list[int]:
    return [x["id"] for x in subs if (x["email"], x["name"]) in SAMPLE_SUBSCRIBERS]


def remove_sample_lists(lm: Client) -> None:
    emails = ",".join(f"'{e}'" for e, _ in SAMPLE_SUBSCRIBERS)
    subs = lm.get("/api/subscribers?per_page=all&query=" + quote(f"subscribers.email IN ({emails})"))
    for sub_id in sample_subscriber_ids(subs if isinstance(subs, list) else subs.get("results", [])):
        lm.delete(f"/api/subscribers/{sub_id}")
        print(f"suscriptor de ejemplo borrado: {sub_id}")
    lists = lm.get("/api/lists?per_page=all")
    for list_id in sample_lists_to_delete(lists if isinstance(lists, list) else lists.get("results", [])):
        lm.delete(f"/api/lists/{list_id}")
        print(f"lista de ejemplo borrada: {list_id}")


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
    remove_sample_lists(lm)
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
