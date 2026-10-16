# HONEY v1 — diseño técnico del asistente del sitio

**Versión:** 1.2 (1.1 aprobado por Carlos el 2026-10-15; 1.2 del 2026-10-16: el sitio se simplifica y el whitepaper técnico sale de la base) · **Fecha:** 2026-10-16
**Documento de producto:** [HONEY v1 — Especificación](https://claude.ai/code/artifact/fec1a344-7ded-4443-924b-abdd28fbb16d) (personalidad, reglas, preguntas frecuentes). Este documento dice _cómo_ se construye; aquel dice _qué_ responde.

## 1. Decisiones de Carlos (14 oct 2026)

- El modelo es **Claude Haiku 5.5** (`claude-haiku-5-5`) por la API de Anthropic.
- Todo lo demás vive **dentro del VPS**: el widget, el servicio, la base de conocimiento y los registros.
- Antes de enviar cualquier texto a la API pasa por un **filtro de datos personales**.
- El modelo es **intercambiable**. Cuando el VPS tenga más núcleos se podrá cambiar por un modelo local sin tocar el widget.
- Los textos dicen siempre **«el asistente»**.

## 2. Qué hace v1

Hay una burbuja en la esquina inferior derecha de todas las páginas de opencivicsolutions.org. Quien la abre:

1. lee la presentación fija;
2. puede tocar 4 preguntas sugeridas;
3. puede escribir la suya.

HONEY responde en 2 a 4 frases, en español, solo con la base de conocimiento aprobada. Cada respuesta cita su fuente con enlace. Si la respuesta no está en la base, lo dice y enlaza a `/contacto`.

**Fuera de v1:**

- correo `honey@`;
- otros idiomas;
- memoria entre visitas;
- cualquier acción en nombre del usuario.

## 3. Arquitectura

```
Navegador ──POST /honey/chat──▶ Traefik ──▶ honey (contenedor Python)
   │                              │             ├─ filtro de datos personales
   │                              │             ├─ límites (por IP en Traefik, diario en el servicio)
   │                              │             ├─ base de conocimiento (archivos .md dentro de la imagen)
   │                              │             └─ cliente del modelo ──HTTPS──▶ API de Anthropic
   └── sitio React (nginx) ◀── Traefik            registros: volumen honey-registros (30 días)
```

### 3.1 Sin buscador vectorial en v1 (cambio respecto al documento de producto)

El documento de producto previó pgvector, pero **no hace falta en v1**. Toda la base aprobada cabe holgada en una sola petición:

- 14 preguntas frecuentes;
- la Razón de ser (339 palabras);
- textos de las páginas del sitio.

Son menos de 30 000 tokens. Por eso **se envía la base completa en cada pregunta**, marcada para la caché de prompts de Anthropic. Las preguntas siguientes reutilizan esa parte a una fracción del precio.

Ventajas:

- No hay modelo de embeddings ni índice que mantener.
- Los 2 núcleos del VPS no cargan nada extra.
- No hay fallos de búsqueda: el modelo ve siempre toda la base.

Cada documento va como bloque `document` con `citations: {enabled: true}`. La API devuelve exactamente qué frase de qué documento respalda la respuesta, y con eso el widget arma el chip de fuente.

**Cuándo cambiar:** si la base supera unos 150 000 tokens, se añade una búsqueda previa y solo se envían los fragmentos relevantes. Eso queda para v3, cuando entre el blog.

### 3.2 El servicio `honey`

- **Tecnología:** Python 3.13 con el SDK oficial `anthropic`, igual que el portero del boletín. Corre como `nobody`, con sistema de archivos de solo lectura salvo el volumen de registros.
- **Rutas:**
  - `POST /honey/chat` responde preguntas.
  - `POST /honey/util` registra los votos «Útil» y «No útil».
  - `GET /honey/salud` devuelve 200 con `{"activo": true}` cuando HONEY está encendido, y 503 con `{"activo": false}` cuando está apagado.
  - `GET /honey/vivo` devuelve siempre 200. Lo usa el chequeo de salud de Docker, para que el contenedor apagado no aparezca como «con problemas» en hPanel.
- **Encendido:** HONEY responde solo si `HONEY_ACTIVO=1` y existe `ANTHROPIC_API_KEY` en el `.env`. Si falta cualquiera de las dos, el contenedor corre apagado.
- **Enrutamiento:** Traefik, con prioridad sobre el sitio, como `/boletin/suscribir`. Si el contenedor no está, nginx responde 404 en `/honey/` y la burbuja no aparece.
- **Intercambio de modelo:** una sola variable, `HONEY_MODELO`.
  - Hoy vale `anthropic:claude-haiku-5-5`.
  - `falso:` es un modelo de prueba que no llama a ninguna API. Sirve para las pruebas locales y la vista previa.
  - Más adelante se agrega `local:<nombre>`.

  Cada proveedor recibe la base al crearse e implementa `responder(historial, pregunta) → Respuesta(texto, estado, fuentes)`.

**Petición** (JSON, como máximo 8 KB):

```json
{
  "pregunta": "¿Cómo participo?",
  "historial": [
    { "rol": "usuario", "texto": "..." },
    { "rol": "asistente", "texto": "..." }
  ]
}
```

**Respuesta:**

```json
{
  "id": "r_8f3a…",
  "texto": "…",
  "fuentes": [{ "titulo": "Preguntas frecuentes", "url": "/proyectos" }],
  "estado": "ok"
}
```

`estado` puede valer:

- `ok`: respuesta normal;
- `sin_respuesta`: la base no cubre la pregunta, y el texto ofrece `/contacto`;
- `no_disponible`: se acabó el límite diario o la API falló;
- `rechazada`: el modelo se negó por seguridad, y se muestra un mensaje amable.

### 3.3 Llamada al modelo

- Modelo `claude-haiku-5-5` con `output_config: {effort: "low"}`, porque es chat corto. `max_tokens: 4096`, con margen para el razonamiento interno del modelo.
- `system` lleva el prompt de HONEY: personalidad, las 10 reglas y el formato de respuesta. Es texto fijo de la imagen, sin fechas ni datos variables, para que la caché funcione.
- La base va en el primer mensaje como bloques `document` con `cache_control` en el último. Después van el historial y la pregunta.
- Cuando la base no cubre la pregunta, el prompt pide empezar la respuesta con la marca `[SIN_RESPUESTA]`. El servicio quita la marca y devuelve `estado: sin_respuesta`. Así la detección no depende de adivinar.
- Se revisa `stop_reason`:
  - `refusal` → `rechazada`;
  - `max_tokens` → se corta en la última frase completa.
- Errores de la API: se reintenta 2 veces, la opción por defecto del SDK. Si sigue fallando → `no_disponible`. Nunca se muestra el error técnico al visitante.

### 3.4 Base de conocimiento

Vive en `honey/base/`, un archivo `.md` por fuente, con cabecera:

```yaml
titulo: Licencias de OpenCivic
url: /
version: 2026-10-12
```

`url` siempre es una ruta del propio sitio (empieza con `/`), y los títulos no se repiten.

Base inicial:

| Archivo                       | Título                              | Enlace       |
| ----------------------------- | ----------------------------------- | ------------ |
| `faq-10-licencias.md`         | Licencias de OpenCivic              | `/`          |
| `faq-13-quien-esta-detras.md` | Quién está detrás de OpenCivic      | `/sobre`     |
| `razon-de-ser.md`             | Razón de ser de OpenCivic Solutions | `/sobre`     |
| `proyectos.md`                | Proyectos de OpenCivic              | `/proyectos` |

- Solo entran preguntas frecuentes en estado **Aprobada** en el documento de producto, una por archivo. Hoy son la 10 (licencia) y la 13 (quién está detrás). Las demás se agregan a medida que Carlos las apruebe.
- El 2026-10-16 Carlos simplificó el sitio: Nicaragua Decide es el único proyecto, el panel técnico de Hash Republic Protocol quedó archivado en GitHub y el Whitepaper v0.5 salió de la base. A preguntas técnicas sobre Hash Republic, HONEY responde que no está en sus documentos. El script `honey/docx_a_texto.py` sigue disponible para convertir futuros `.docx`.
- Cambiar la base es un PR, igual que el blog. Al desplegar, la imagen se reconstruye con los archivos nuevos.
- Una prueba automática verifica que cada archivo tenga `titulo`, `url` y `version`, y que la base total no pase de 150 000 tokens (estimados por caracteres).

## 4. Privacidad

- **Filtro de datos personales.** Corre antes de enviar a la API y antes de guardar en los registros. Sustituye:
  - correos por `[correo]`;
  - cédulas nicaragüenses (`###-######-####X`, con o sin guiones) por `[documento]`;
  - tarjetas de 13 a 19 dígitos por `[tarjeta]`;
  - cualquier otra secuencia de 7 o más dígitos (con `+`, espacios, guiones o paréntesis) por `[teléfono]`. Las fechas `AAAA-MM-DD` no se tocan.

  El historial también pasa por el filtro, en cada petición.

- **Sin identidad:**
  - no hay cookies;
  - no se guarda nada en el navegador: el historial vive solo en la memoria de la pestaña y se pierde al cerrarla;
  - no hay analítica de terceros.
- **Sin IP en registros.** La IP solo la usa Traefik para el límite por minuto y no llega a los registros.
- **Registros mínimos.** Un archivo JSONL por día en el volumen `honey-registros`, con:
  - fecha;
  - pregunta ya filtrada;
  - respuesta;
  - fuentes;
  - `estado`;
  - voto de utilidad.

  El servicio borra los archivos de más de 30 días al arrancar y una vez al día.

- **Clave de la API.** Vive solo en el `.env` del VPS (`ANTHROPIC_API_KEY`), nunca en el repositorio ni en el navegador.
- **Nota de privacidad.** Es una vista dentro del propio panel, que se abre desde el enlace del pie, sin página nueva. Dice que las preguntas, ya filtradas, se procesan con la API de Anthropic. Enlaza a la política vigente de Anthropic, que se revisa y se cita textualmente antes de publicar.

## 5. Abuso y costo

- **Por IP (Traefik):** 6 preguntas por minuto, con ráfaga de 3, agrupando IPv6 por /64, como el boletín.
- **Por petición:**
  - la pregunta tiene como máximo 500 caracteres;
  - el historial guarda como máximo las 6 últimas intervenciones, de 1 000 caracteres cada una;
  - el cuerpo pesa como máximo 8 KB.
- **Límite diario del servicio:** `HONEY_LIMITE_DIARIO`, por defecto 300 preguntas. Al llegar al límite responde `no_disponible` hasta medianoche, hora de Managua. El contador vive en memoria: si el contenedor se reinicia, vuelve a cero. Se acepta porque el tope de gasto de la consola sigue protegiendo.
- **Tope de gasto:** se fija en la consola de Anthropic. Recomendado: **US$10 al mes**.

  Costo estimado con Haiku 5.5, con unos 25 000 tokens de base:

  | Caso                                               | Costo por pregunta | Al mes |
  | -------------------------------------------------- | ------------------ | ------ |
  | Sin caché (preguntas espaciadas)                   | ~US$0.003          | —      |
  | Con caché (preguntas seguidas, menos de 5 min)     | ~US$0.0005         | —      |
  | 30 preguntas al día (tráfico realista al inicio)   | —                  | US$1–3 |
  | 300 preguntas al día (el límite diario, sin caché) | —                  | ~US$25 |

  Si se alcanza el tope de la consola, la API deja de responder y HONEY pasa a `no_disponible`. El tope es la red de seguridad final.

## 6. El widget

- **Integración:** un componente React en `src/components/honey/`. Se carga con `React.lazy` en un archivo aparte, así no frena el sitio.
- **Cuándo se muestra:** solo si `GET /honey/salud` responde 200 con `{"activo": true}`. Se exige el JSON porque, sin el contenedor, una ruta desconocida podría devolver la página del sitio con 200.
- **Aspecto:**
  - burbuja con el ícono de la abeja de OpenCivic (`opencivic-icono-192.png`) mientras no lleguen las imágenes de la mascota HONEY;
  - las imágenes por estado del documento de producto se agregan cuando Carlos las comparta;
  - panel en azul marino y dorado.
- **Contenido del panel:**
  - encabezado «HONEY · asistente IA de OpenCivic»;
  - presentación fija;
  - 4 preguntas sugeridas, elegidas entre las que la base aprobada ya responde: «¿Qué es OpenCivic?», «¿Qué proyectos tienen?», «¿Qué licencia usan?» y «¿Quién está detrás de OpenCivic?». Se cambian cuando crezca la base;
  - respuestas con chip de fuente y botones «Útil» y «No útil»;
  - pie fijo con el aviso de IA y el enlace a la nota de privacidad.
- **Estados:** cerrado, escribiendo (tres puntos animados), respondió, no sabe y no disponible.
- **Accesibilidad:**
  - se usa todo con teclado;
  - la burbuja es un `button` con `aria-label`;
  - el panel es un `dialog`;
  - las respuestas se anuncian con `aria-live="polite"`;
  - contraste AA;
  - sin animación si el sistema pide «reducir movimiento».
- **Seguridad del sitio:** solo llama a `/honey/` en el mismo dominio, sin cambios en la CSP. El texto de las respuestas se muestra como texto plano, nunca como HTML.

## 7. Pruebas

- **Servicio, con unittest y un modelo falso, sin gastar API:**
  - filtro de datos personales (cada patrón, falsos positivos con años y precios);
  - validación de la petición;
  - límite diario;
  - borrado de registros a 30 días;
  - armado de la petición: la base va con `cache_control` y el `system` es idéntico entre dos peticiones;
  - traducción de `stop_reason` y de errores a `estado`;
  - lectura de citas → `fuentes`.
- **Widget:**
  - prueba con el sitio en vista previa;
  - la burbuja aparece o no según `/honey/salud`;
  - flujo de pregunta y respuesta contra el servicio con modelo falso.
- **Evaluación real, con autorización de Carlos (unos centavos de dólar):** 30 preguntas:
  - preguntas que la base aprobada responde, y sus variaciones;
  - preguntas fuera de tema;
  - intentos de manipulación;
  - datos personales.

  Criterio del documento de producto: al menos 9 de cada 10 correctas y con fuente, y cero respuestas inventadas fuera de la base.

## 8. Puesta en marcha

1. Carlos crea la clave en console.anthropic.com, fija el tope de US$10 al mes y la escribe él mismo en el `.env` del VPS. La clave nunca pasa por el chat.
2. Se despliega con el servicio apagado: la burbuja no aparece.
3. Corremos la evaluación real.
4. Con la autorización de Carlos se enciende el servicio, y la burbuja aparece sola.

## 9. Riesgos aceptados

- Mientras solo haya 2 preguntas frecuentes aprobadas, HONEY dirá «no lo sé» a menudo. Es preferible a inventar.
- Las preguntas, ya filtradas, salen del VPS hacia Anthropic. El filtro reduce el riesgo, pero no reconoce nombres propios ni descripciones de situaciones. Por eso la presentación pide no escribir datos personales.
