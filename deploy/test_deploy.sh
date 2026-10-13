#!/bin/sh
# Prueba de opencivic-deploy.sh sin servidor: un repo de prueba, un "origin"
# local y un docker falso que registra las llamadas. Corre en un contenedor:
#   MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/deploy:/d:ro" alpine:3.20 sh /d/test_deploy.sh
set -u
apk add -q git util-linux >/dev/null
W=$(mktemp -d)
git config --global user.email prueba@ejemplo.org
git config --global user.name prueba
git config --global init.defaultBranch master
git init -q --bare "$W/origin.git"
git clone -q "$W/origin.git" "$W/trabajo" 2>/dev/null
git clone -q "$W/origin.git" "$W/servidor" 2>/dev/null

# docker falso: registra cada "compose run … borrador.py /posts/X" y puede
# fallar en "compose up" (FALLA_UP=1) o en un borrador (FALLA_BORRADOR=nombre).
mkdir -p "$W/bin"
cat > "$W/bin/docker" <<'EOF'
#!/bin/sh
case "$*" in
  "compose up"*) [ "${FALLA_UP:-}" = 1 ] && exit 1; exit 0 ;;
  "compose run"*borrador.py*)
    post=$(echo "$*" | sed 's/.*borrador.py //')
    case "$post" in *"${FALLA_BORRADOR:-@@}"*) exit 1 ;; esac
    echo "$post" >> "$LLAMADAS"; exit 0 ;;
  *) exit 0 ;;
esac
EOF
chmod +x "$W/bin/docker"
export PATH="$W/bin:$PATH" LLAMADAS="$W/llamadas" DEPLOY_DIR="$W/servidor" \
  ESTADO="$W/estado/borradores-hasta" DEPLOY_LOCK="$W/lock"

publicar() { # agrega artículos y los empuja a origin
  for f in "$@"; do echo "hola" > "$W/trabajo/src/content/posts/$f"; done
  git -C "$W/trabajo" add -A && git -C "$W/trabajo" commit -qm "$*" && git -C "$W/trabajo" push -q origin master 2>/dev/null
}
desplegar() { : > "$LLAMADAS"; sh /d/opencivic-deploy.sh >/dev/null 2>&1; }
llamadas() { tr '\n' ' ' < "$LLAMADAS" | sed 's/ $//'; }
fail=0
check() { # descripción, esperado, obtenido
  if [ "$2" = "$3" ]; then echo "ok    $1"; else echo "FALLA $1: esperado [$2], obtenido [$3]"; fail=1; fi
}

mkdir -p "$W/trabajo/src/content/posts"
publicar 01.md
git -C "$W/servidor" pull -q origin master 2>/dev/null

publicar 02.md 03.md
desplegar
check "dos artículos nuevos, dos borradores" "/posts/02.md /posts/03.md" "$(llamadas)"

publicar 04.md
FALLA_UP=1 desplegar
check "despliegue fallido: ningún borrador" "" "$(llamadas)"

publicar 05.md
desplegar
check "el siguiente despliegue recupera el pendiente" "/posts/04.md /posts/05.md" "$(llamadas)"

publicar 06.md
FALLA_BORRADOR=06.md desplegar
check "borrador fallido no se da por hecho" "" "$(llamadas)"
desplegar
check "se reintenta en el siguiente despliegue" "/posts/06.md" "$(llamadas)"

desplegar
check "sin cambios, sin borradores" "" "$(llamadas)"

rm -rf "$W"
exit $fail
