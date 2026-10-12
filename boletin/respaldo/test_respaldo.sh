#!/bin/sh
# Prueba de respaldo.sh con la pila local. Corre dentro de un contenedor con el
# cliente de Docker (necesita el socket) y crea una clave age desechable:
#   MSYS_NO_PATHCONV=1 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
#     -v "$PWD/boletin/respaldo:/r:ro" docker:cli sh /r/test_respaldo.sh
set -u
apk add -q bash age gzip >/dev/null
W=$(mktemp -d)
age-keygen -o "$W/clave.txt" 2>/dev/null
age-keygen -y "$W/clave.txt" > "$W/pub.txt"
export RESPALDO_SIN_SUBIDA=1 AGE_RECIPIENT_FILE="$W/pub.txt" REPO=/r
fail=0

# 1. Si pg_dump falla, el script falla y no deja ninguna copia.
RESPALDO_DIR="$W/malo" BOLETIN_DB_CONTAINER=no-existe sh /r/respaldo.sh >/dev/null 2>&1
rc=$?
n=$(find "$W/malo" -name 'listmonk-*.age' 2>/dev/null | wc -l)
if [ "$rc" -ne 0 ] && [ "$n" -eq 0 ]; then echo "ok    volcado fallido: rc=$rc y sin copia"
else echo "FALLA volcado fallido: rc=$rc y $n copia(s)"; fail=1; fi

# 2. Con la base real, la copia existe y se descifra con la clave privada.
RESPALDO_DIR="$W/bueno" BOLETIN_DB_CONTAINER=opencivic-boletin-db sh /r/respaldo.sh >/dev/null 2>&1
rc=$?
f=$(find "$W/bueno" -name 'listmonk-*.age' | head -1)
tablas=$( [ -n "$f" ] && age -d -i "$W/clave.txt" "$f" | gunzip | grep -c 'CREATE TABLE' || echo 0)
if [ "$rc" -eq 0 ] && [ "${tablas:-0}" -gt 10 ]; then echo "ok    copia buena: $tablas tablas"
else echo "FALLA copia buena: rc=$rc, tablas=${tablas:-0}"; fail=1; fi

rm -rf "$W"
exit $fail
