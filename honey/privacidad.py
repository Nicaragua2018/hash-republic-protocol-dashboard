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
_FECHA = re.compile(r"\d{4}-\d{2}-\d{2}")


def _telefono(m: re.Match) -> str:
    return m.group() if _FECHA.fullmatch(m.group()) else "[teléfono]"


def filtrar(texto: str) -> str:
    texto = _CORREO.sub("[correo]", texto)
    texto = _CEDULA.sub("[documento]", texto)
    texto = _TARJETA.sub("[tarjeta]", texto)
    return _NUMERO.sub(_telefono, texto)
