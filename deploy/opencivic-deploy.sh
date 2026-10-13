#!/bin/sh
# Comando forzado de la llave de despliegue (authorized_keys del VPS):
#   restrict,command="/usr/local/bin/opencivic-deploy.sh" ssh-ed25519 …
# Se instala a mano desde el repo; un "git pull" no lo reemplaza solo.
# Las variables de abajo solo se cambian en las pruebas (test_deploy.sh).
set -eu
DIR=${DEPLOY_DIR:-/docker/hrp-dashboard}
ESTADO=${ESTADO:-/var/lib/opencivic/borradores-hasta}
LOCK=${DEPLOY_LOCK:-/var/lock/opencivic-deploy.lock}

exec 9>"$LOCK"
flock 9
cd "$DIR"
antes=$(git rev-parse HEAD)
git pull --ff-only --quiet origin master
despues=$(git rev-parse HEAD)
docker compose up -d --build
docker image prune -f >/dev/null

# Un borrador por cada artículo nuevo (spec del boletín, punto 2). Se parte
# del último commit cuyos borradores ya se crearon, no del despliegue
# anterior: si un despliegue falló o un borrador no se pudo crear, el
# siguiente lo recupera (borrador.py no duplica). Un fallo aquí no tumba el
# despliegue: el sitio ya está publicado.
base=$(cat "$ESTADO" 2>/dev/null || echo "$antes")
git merge-base --is-ancestor "$base" "$despues" 2>/dev/null || base=$antes
fallos=0
for archivo in $(git diff --name-only --diff-filter=A "$base" "$despues" -- src/content/posts/); do
  # </dev/null: si no, "docker compose run" leería la entrada estándar.
  if ! docker compose run --rm -T boletin-herramientas python borrador.py "/posts/$(basename "$archivo")" </dev/null; then
    echo "aviso: no se pudo crear el borrador de $archivo; se reintentará en el próximo despliegue" >&2
    fallos=1
  fi
done
if [ "$fallos" = 0 ]; then
  mkdir -p "$(dirname "$ESTADO")"
  echo "$despues" > "$ESTADO"
fi
echo "desplegado $despues"
