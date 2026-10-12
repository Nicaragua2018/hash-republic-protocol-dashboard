#!/bin/sh
# Copia diaria de la base del boletín (cron del VPS, como root):
#   15 3 * * * /docker/hrp-dashboard/boletin/respaldo/respaldo.sh >> /var/log/opencivic-respaldo.log 2>&1
# Cifra con la clave PÚBLICA de Carlos: el VPS puede crear copias pero no leerlas.
set -eu
REPO=/docker/hrp-dashboard
DIR=/var/backups/opencivic-boletin
. /etc/opencivic-respaldo.env
mkdir -p "$DIR"
chmod 700 "$DIR"
FILE="$DIR/listmonk-$(date -u +%Y-%m-%dT%H%MZ).sql.gz.age"
docker exec opencivic-boletin-db pg_dump -U listmonk --no-owner listmonk \
  | gzip -9 \
  | age -R "$REPO/boletin/respaldo/age-recipient.txt" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'listmonk-*.sql.gz.age' -mtime +14 -delete
docker run --rm -v "$DIR:/datos:ro" -v "$REPO/boletin/respaldo:/app:ro" \
  -e B2_KEY_ID -e B2_APP_KEY -e B2_BUCKET_ID python:3.13-alpine \
  python /app/subir_b2.py "/datos/$(basename "$FILE")"
echo "$(date -u +%FT%TZ) respaldo ok: $(basename "$FILE")"
