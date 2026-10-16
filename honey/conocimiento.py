"""Base de conocimiento de HONEY: un archivo .md por fuente, con cabecera.

---
titulo: Licencias de OpenCivic
url: /
version: 2026-10-12
---
Texto de la fuente.
"""

from dataclasses import dataclass
from pathlib import Path

# Por encima de esto conviene buscar fragmentos en vez de enviar toda la base.
LIMITE_TOKENS = 150_000
CAMPOS = ("titulo", "url", "version")


@dataclass(frozen=True)
class Documento:
    titulo: str
    url: str
    version: str
    texto: str


def leer(ruta: Path) -> Documento:
    contenido = ruta.read_text(encoding="utf-8").replace("\r\n", "\n")
    if not contenido.startswith("---\n"):
        raise ValueError(f"{ruta.name}: falta la cabecera ---")
    cabecera, _, texto = contenido[4:].partition("\n---\n")
    campos = {}
    for linea in cabecera.splitlines():
        clave, sep, valor = linea.partition(":")
        if sep:
            campos[clave.strip()] = valor.strip()
    faltan = [c for c in CAMPOS if not campos.get(c)]
    if faltan:
        raise ValueError(f"{ruta.name}: faltan {', '.join(faltan)}")
    url = campos["url"]
    if not url.startswith("/") or url.startswith("//"):
        raise ValueError(f"{ruta.name}: la url debe ser una ruta del sitio (empieza con /)")
    if not texto.strip():
        raise ValueError(f"{ruta.name}: no tiene texto")
    return Documento(campos["titulo"], url, campos["version"], texto.strip())


def estimar_tokens(docs: list[Documento]) -> int:
    # En español rinde ~4 caracteres por token; con 3 la estimación queda holgada.
    return sum(len(d.texto) for d in docs) // 3


def cargar(directorio: Path) -> list[Documento]:
    docs = [leer(r) for r in sorted(directorio.glob("*.md"))]
    if not docs:
        raise ValueError(f"la base de conocimiento está vacía ({directorio})")
    vistos = set()
    for d in docs:
        if d.titulo in vistos:
            raise ValueError(f"título repetido en la base: {d.titulo}")
        vistos.add(d.titulo)
    if estimar_tokens(docs) > LIMITE_TOKENS:
        raise ValueError(f"la base es demasiado grande ({estimar_tokens(docs)} tokens estimados)")
    return docs
