#!/bin/sh
# Comprueba las rutas de HONEY en la pila local (la misma del boletín).
# Uso: sh honey/local/rutas.sh   (con honey encendido y HONEY_MODELO=falso:)
set -u
S=https://localhost:58443
W=https://www.localhost:58443
R="--resolve localhost:58443:127.0.0.1 --resolve www.localhost:58443:127.0.0.1"
J="Content-Type: application/json"
fail=0
check() { # descripción, código esperado, argumentos de curl
  desc=$1; want=$2; shift 2
  got=$(curl -sk $R -o /dev/null -w '%{http_code}' "$@")
  if [ "$got" = "$want" ]; then echo "ok    $desc ($got)"; else echo "FALLA $desc: esperado $want, recibido $got"; fail=1; fi
}
check "vivo"                     200 "$S/honey/vivo"
check "salud (encendido)"        200 "$S/honey/salud"
check "salud en www"             200 "$W/honey/salud"
check "voto inválido"            400 -X POST -H "$J" -d '{"id":"x","util":true}' "$S/honey/util"
check "ruta desconocida"         404 "$S/honey/otra"
check "chat responde"            200 -X POST -H "$J" -d '{"pregunta":"hola"}' "$S/honey/chat"
# Límite por IP del chat: 6 por minuto con ráfaga de 3. Seis más seguidas: la última debe ser 429.
ultimo=""
for i in 1 2 3 4 5 6; do
  ultimo=$(curl -sk $R -o /dev/null -w '%{http_code}' -X POST -H "$J" -d '{"pregunta":"hola"}' "$S/honey/chat")
done
if [ "$ultimo" = 429 ]; then echo "ok    límite por IP del chat (429)"; else echo "FALLA límite por IP: último código $ultimo"; fail=1; fi
exit $fail
