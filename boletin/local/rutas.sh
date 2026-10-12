#!/bin/sh
# Comprueba el enrutamiento de Traefik en la pila local. Uso: sh boletin/local/rutas.sh
set -u
S=https://localhost:58443
B=https://boletin.localhost:58443
R="--resolve boletin.localhost:58443:127.0.0.1 --resolve localhost:58443:127.0.0.1"
fail=0
check() { # descripción, código esperado, argumentos de curl
  desc=$1; want=$2; shift 2
  got=$(curl -sk $R -o /dev/null -w '%{http_code}' "$@")
  if [ "$got" = "$want" ]; then echo "ok    $desc ($got)"; else echo "FALLA $desc: esperado $want, recibido $got"; fail=1; fi
}
check "panel responde"                       200 "$B/health"
check "reto ALTCHA en el sitio"              200 "$S/boletin/altcha"
check "widget ALTCHA en el sitio"            200 "$S/boletin/altcha.js"
check "portero responde 303"                 303 -X POST -d "email=a@b.org" "$S/boletin/suscribir"
check "API pública de suscripción bloqueada" 403 -X POST -H 'Content-Type: application/json' -d '{}' "$B/api/public/subscription"
check "formulario directo bloqueado"         403 -X POST -d "email=a@b.org" "$B/subscription/form"
check "API con token bloqueada"              403 -H "Authorization: token borradores:x" "$B/api/campaigns"
check "página de confirmación del opt-in"    200 "$B/subscription/form"
exit $fail
