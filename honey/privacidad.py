"""Filtro de datos personales de HONEY.

Corre antes de enviar cualquier texto al modelo y antes de guardarlo en los
registros. Sustituye lo que reconoce por una marca; no intenta reconocer
nombres ni descripciones, por eso el widget pide no escribir datos personales.
"""

import re

_CORREO = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
# Cédula nicaragüense: 001-010190-0001A, con o sin guiones.
_CEDULA = re.compile(r"\b\d{3}-?\d{6}-?\d{4}[A-Za-z]\b")
# Tarjetas: 13 a 19 dígitos, con espacios o guiones entre grupos.
_TARJETA = re.compile(r"\b(?:\d[ -]?){12,18}\d\b")
# Cualquier otra secuencia de 7 o más dígitos: teléfonos y otros números de
# identidad. El punto no separa, para no tocar cifras como 1.000.000.
_NUMERO = re.compile(r"(?<!\w)\(?\+?\d(?:[ ()-]*\d){6,}")
# Fechas AAAA-MM-DD: se apartan antes de filtrar para que no se lean como
# teléfono ni tarjeta (ni se peguen al número que las sigue).
_FECHA = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
# Marca de una fecha apartada: dos caracteres de uso privado (U+E000 y el índice).
_MARCA = ""
_BASE_INDICE = 0xE100
_APARTADA = re.compile(_MARCA + "([-])")
# Rachas de años separadas por espacios: «2025 2026 2027».
_ANOS = re.compile(r"(?:19|20)\d\d(?: (?:19|20)\d\d)+")


def _telefono(m: re.Match) -> str:
    numero = m.group()
    # Cifras redondas sin separadores (1000000, 21000000): son montos, no teléfonos.
    if numero.isdigit() and numero.endswith("000"):
        return numero
    if _ANOS.fullmatch(numero):
        return numero
    return "[teléfono]"


def filtrar(texto: str) -> str:
    fechas: list[str] = []

    def apartar(m: re.Match) -> str:
        fechas.append(m.group())
        return _MARCA + chr(_BASE_INDICE + len(fechas) - 1)

    # La marca no puede venir del visitante: se quita antes de apartar fechas.
    texto = _FECHA.sub(apartar, texto.replace(_MARCA, ""))
    texto = _CORREO.sub("[correo]", texto)
    texto = _CEDULA.sub("[documento]", texto)
    texto = _TARJETA.sub("[tarjeta]", texto)
    texto = _NUMERO.sub(_telefono, texto)
    return _APARTADA.sub(lambda m: fechas[ord(m.group(1)) - _BASE_INDICE], texto)
