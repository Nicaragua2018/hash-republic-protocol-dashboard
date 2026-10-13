#!/bin/sh
# Copia diaria de la base del boletín (cron del VPS, como root):
#   15 3 * * * /docker/hrp-dashboard/boletin/respaldo/respaldo.sh >> /var/log/opencivic-respaldo.log 2>&1
# Cifra con la clave PÚBLICA de Carlos: el VPS puede crear copias pero no leerlas.
# Las variables de abajo solo se cambian en las pruebas (test_respaldo.sh).
set -eu
REPO=${REPO:-/docker/hrp-dashboard}
DIR=${RESPALDO_DIR:-/var/backups/opencivic-boletin}
CONTAINER=${BOLETIN_DB_CONTAINER:-opencivic-boletin-db}
ENV_FILE=${RESPALDO_ENV:-/etc/opencivic-respaldo.env}
RECIPIENT=${AGE_RECIPIENT_FILE:-$REPO/boletin/respaldo/age-recipient.txt}
mkdir -p "$DIR"
chmod 700 "$DIR"
FILE="$DIR/listmonk-$(date -u +%Y-%m-%dT%H%MZ).sql.gz.age"
DUMP=$(mktemp "$DIR/.volcado.XXXXXX")
trap 'rm -f "$DUMP" "$FILE.tmp" "$FILE.tmp.gz"' EXIT
# Primero el volcado completo a un archivo: en una tubería, un pg_dump fallido
# pasaría inadvertido y se cifraría y subiría una copia vacía como si fuera buena.
docker exec "$CONTAINER" pg_dump -U listmonk --no-owner listmonk > "$DUMP"
if ! grep -q 'PostgreSQL database dump complete' "$DUMP"; then
  echo "$(date -u +%FT%TZ) respaldo FALLÓ: el volcado está incompleto" >&2
  exit 1
fi
gzip -9 < "$DUMP" > "$FILE.tmp.gz"
age -R "$RECIPIENT" -o "$FILE.tmp" "$FILE.tmp.gz"
rm -f "$FILE.tmp.gz"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'listmonk-*.sql.gz.age' -mtime +14 -delete
# Copia fuera del VPS en Backblaze B2 solo si sus llaves están configuradas.
# Decisión de Carlos (12 oct. 2026): por ahora, sin Backblaze; la única copia
# externa es la exportación mensual a CSV que él guarda en su PC.
if [ "${RESPALDO_SIN_SUBIDA:-}" != 1 ] && [ -f "$ENV_FILE" ]; then
  # shellcheck source=/dev/null
  . "$ENV_FILE"
  docker run --rm -v "$DIR:/datos:ro" -v "$REPO/boletin/respaldo:/app:ro" \
    -e B2_KEY_ID -e B2_APP_KEY -e B2_BUCKET_ID python:3.13-alpine \
    python /app/subir_b2.py "/datos/$(basename "$FILE")"
  echo "$(date -u +%FT%TZ) respaldo ok: $(basename "$FILE") (VPS y Backblaze)"
else
  echo "$(date -u +%FT%TZ) respaldo ok: $(basename "$FILE") (solo en el VPS)"
fi
