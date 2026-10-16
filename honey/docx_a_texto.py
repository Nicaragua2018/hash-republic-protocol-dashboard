"""Convierte un .docx en un archivo de la base de HONEY (solo biblioteca estándar).

Uso:
  python docx_a_texto.py entrada.docx base/salida.md "Título" /ruta-del-sitio version
"""

import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def _parrafos(ruta: Path) -> list[str]:
    with zipfile.ZipFile(ruta) as z:
        raiz = ET.fromstring(z.read("word/document.xml"))
    salida = []
    for p in raiz.iter(f"{W}p"):
        partes = []
        for el in p.iter():
            if el.tag == f"{W}t":
                partes.append(el.text or "")
            elif el.tag in (f"{W}tab", f"{W}br"):
                partes.append(" ")
        texto = " ".join("".join(partes).split())
        if texto:
            salida.append(texto)
    return salida


def convertir(ruta: Path, titulo: str, url: str, version: str) -> str:
    cuerpo = "\n\n".join(_parrafos(ruta))
    return f"---\ntitulo: {titulo}\nurl: {url}\nversion: {version}\n---\n{cuerpo}\n"


if __name__ == "__main__":
    entrada, salida, titulo, url, version = sys.argv[1:6]
    Path(salida).write_text(convertir(Path(entrada), titulo, url, version), encoding="utf-8", newline="\n")
