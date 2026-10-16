# HONEY — el asistente del sitio

Diseño: `docs/superpowers/specs/2026-10-14-honey-asistente-design.md`.

## Encender y apagar (en el VPS, `/docker/hrp-dashboard/.env`)

| Variable              | Valor                             | Para qué                            |
| --------------------- | --------------------------------- | ----------------------------------- |
| `ANTHROPIC_API_KEY`   | la clave de console.anthropic.com | Sin ella, HONEY queda apagado       |
| `HONEY_ACTIVO`        | `1` encendido, `0` apagado        | Apagado, la burbuja no aparece      |
| `HONEY_LIMITE_DIARIO` | `300`                             | Preguntas por día (hora de Managua) |

Después de cambiar `.env`: `docker compose up -d honey`.

## Cambiar la base de conocimiento

Un archivo `.md` por fuente en `base/`, con cabecera `titulo`, `url` (ruta del sitio) y `version`. Solo preguntas frecuentes **Aprobadas**. El cambio entra por PR; al desplegar se reconstruye la imagen.

Un `.docx` se convierte con:

```
python docx_a_texto.py entrada.docx base/salida.md "Título" /ruta version
```

En Git Bash de Windows, anteponer `MSYS_NO_PATHCONV=1`: si no, `/ruta` se convierte en una ruta de Windows.

## Pruebas

```
python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m unittest discover -v
```

Rutas en la pila local: `sh honey/local/rutas.sh` (ver `boletin/local/compose.local.yml`).

## Evaluación real (cuesta centavos; con autorización)

```
docker compose run --rm -T honey python evaluar.py </dev/null
```

## Registros

Volumen `honey-registros`, un `AAAA-MM-DD.jsonl` por día, borrado a los 30 días. Sin IP ni identidad.
