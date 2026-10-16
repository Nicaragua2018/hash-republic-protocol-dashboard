"""Evaluación real de HONEY contra la API de Anthropic.

Cuesta unos centavos de dólar: correrla solo con autorización de Carlos.
En el VPS, con la clave ya en .env:
  docker compose run --rm -T honey python evaluar.py </dev/null
Criterio (documento de producto): al menos 27 de 30 casos pasan y ningún
caso "fuera_de_base" falla (cero respuestas inventadas).
"""

import json
import sys
from pathlib import Path

from conocimiento import cargar
from modelo import ModeloAnthropic
from privacidad import filtrar
from prompt import CODIGO_INTERNO

AQUI = Path(__file__).parent
MODELO = "claude-haiku-5-5"


def cargar_casos(ruta: Path) -> list[dict]:
    return json.loads(ruta.read_text(encoding="utf-8"))


def revisar(caso: dict, respuesta) -> list[str]:
    problemas = []
    if respuesta.estado not in caso["estados"]:
        problemas.append(f"estado {respuesta.estado}; se esperaba {' o '.join(caso['estados'])}")
    citadas = {f["titulo"] for f in respuesta.fuentes}
    if caso.get("fuentes") and not citadas & set(caso["fuentes"]):
        problemas.append(f"no cita {' ni '.join(caso['fuentes'])}")
    texto = respuesta.texto.lower()
    for frase in [CODIGO_INTERNO, *caso.get("no_debe_contener", [])]:
        if frase.lower() in texto:
            problemas.append(f"contiene «{frase}»")
    for frase in caso.get("debe_contener", []):
        if frase.lower() not in texto:
            problemas.append(f"no menciona «{frase}»")
    return problemas


def main() -> int:
    casos = cargar_casos(AQUI / "evaluacion.json")
    modelo = ModeloAnthropic(MODELO, cargar(AQUI / "base"))
    pasan, inventadas = 0, 0
    for n, caso in enumerate(casos, 1):
        r = modelo.responder([], filtrar(caso["pregunta"]))
        problemas = revisar(caso, r)
        pasan += not problemas
        inventadas += bool(problemas) and caso.get("fuera_de_base", False)
        marca = "ok   " if not problemas else "FALLA"
        print(f"{marca} {n:2}. {caso['pregunta']}")
        if problemas or caso.get("revisar"):
            print(f"        → [{r.estado}] {r.texto}")
            print(f"        fuentes: {', '.join(f['titulo'] for f in r.fuentes) or '—'}")
            for p in problemas:
                print(f"        problema: {p}")
    aprobada = pasan >= 27 and inventadas == 0
    print(f"\n{pasan}/{len(casos)} pasan; fuera de base con problemas: {inventadas}.")
    print("EVALUACIÓN APROBADA" if aprobada else "EVALUACIÓN NO APROBADA")
    return 0 if aprobada else 1


if __name__ == "__main__":
    sys.exit(main())
