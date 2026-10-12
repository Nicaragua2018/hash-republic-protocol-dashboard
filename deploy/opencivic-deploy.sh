#!/bin/sh
# Comando forzado de la llave de despliegue (authorized_keys del VPS):
#   restrict,command="/usr/local/bin/opencivic-deploy.sh" ssh-ed25519 …
# Se instala a mano desde el repo; un "git pull" no lo reemplaza solo.
set -eu
exec 9>/var/lock/opencivic-deploy.lock
flock 9
cd /docker/hrp-dashboard
antes=$(git rev-parse HEAD)
git pull --ff-only --quiet origin master
despues=$(git rev-parse HEAD)
docker compose up -d --build
docker image prune -f >/dev/null

# Un borrador por cada artículo nuevo (spec del boletín, punto 2). Un fallo
# aquí no tumba el despliegue: el sitio ya está publicado.
if [ "$antes" != "$despues" ]; then
  git diff --name-only --diff-filter=A "$antes" "$despues" -- src/content/posts/ \
    | while read -r archivo; do
        docker compose run --rm -T boletin-herramientas python borrador.py "/posts/$(basename "$archivo")" \
          || echo "aviso: no se pudo crear el borrador de $archivo" >&2
      done
fi
echo "desplegado $despues"
