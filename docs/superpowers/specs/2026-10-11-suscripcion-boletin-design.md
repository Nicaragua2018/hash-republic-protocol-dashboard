# Suscripción al blog y boletín — diseño

Fecha: 11 de octubre de 2026 · Estado: aprobado en conversación; pendiente de que Carlos revise este documento

## Objetivo

Que cualquier persona pueda dejar su correo en el blog, confirmar que es suyo y recibir los artículos nuevos, y que Carlos pueda escribir boletines propios. Ningún correo sale sin la aprobación de Carlos.

Como parte de los lectores pueden estar en el exilio o en riesgo, la lista de suscriptores es un dato sensible. Se guarda en el servidor de OpenCivic y no en un servicio de terceros.

## Decisiones tomadas

| Tema | Decisión | Quién lo decidió |
|---|---|---|
| Dónde vive la lista | Listmonk autoalojado en el VPS | Carlos |
| Correos por artículo | Se genera un borrador solo; Carlos lo autoriza | Carlos |
| Boletines propios | Sí, escritos por Carlos en Listmonk | Carlos |
| Envío | SMTP del correo de Hostinger, buzón `boletin@opencivicsolutions.org` | Propuesta aprobada |
| Panel | `boletin.opencivicsolutions.org` (subdominio nuevo) | Propuesta aprobada |
| Datos que se piden | Solo el correo | Propuesta aprobada |
| Rastreo | Ninguno: ni aperturas ni clics | Propuesta aprobada |

## Arquitectura

```
Visitante ──► opencivicsolutions.org/blog (formulario)
                 │  POST (formulario HTML + ALTCHA)
                 ▼
          boletin.opencivicsolutions.org  ──►  Traefik  ──►  Listmonk 6.2  ──►  PostgreSQL 17
                                                                 │
                                                                 └──► SMTP Hostinger (boletin@) ──► buzones

GitHub Actions (al fusionar un PR con artículo nuevo, después del despliegue)
                 └──► API de Listmonk: crea la campaña borrador y envía una vista previa a info@
```

### Componentes nuevos

1. **Listmonk 6.2** y **PostgreSQL 17** como dos servicios nuevos en `docker-compose.yml`, con volumen propio para la base de datos. Las contraseñas viven en el `.env` del servidor, nunca en el repositorio.
2. **Formulario de suscripción** en `/blog` y al final de cada artículo (componente React reutilizable).
3. **Página de confirmación** del sitio (`/blog/suscripcion`), a la que Listmonk redirige después de enviar el formulario.
4. **Paso nuevo en el despliegue** que detecta artículos nuevos y crea su campaña borrador.
5. **Copia de seguridad diaria** de la base de Listmonk en el VPS.

## Flujo de suscripción

1. La persona escribe su correo. El formulario incluye el widget **ALTCHA** (paquete npm `altcha`, servido desde el propio sitio), una prueba de trabajo que resuelve el navegador, sin servicios de terceros.
2. El formulario se envía como **formulario HTML** a `https://boletin.opencivicsolutions.org/subscription/form`, con el campo `next` apuntando a la página de confirmación del sitio.
3. Listmonk verifica ALTCHA y crea al suscriptor en la lista "Blog OpenCivic", que es de **doble confirmación**. Envía el correo "Confirma tu suscripción".
4. Solo quien hace clic en ese correo queda suscrito.
5. Todo correo de Listmonk lleva **enlace de baja** y la cabecera `List-Unsubscribe`, para darse de baja con un clic desde el propio cliente de correo.

### Por qué un formulario HTML y no la API JSON

Leí el código de Listmonk 6.2 (`cmd/public.go`). ALTCHA **solo se verifica** en `POST /subscription/form`. El endpoint `POST /api/public/subscription` no comprueba el captcha. Si quedara expuesto, un bot podría usarlo para llenar el buzón de una persona con correos de confirmación y para gastar el cupo diario de envío de Hostinger.

Por eso:
- Traefik **bloquea** `/api/public/subscription` desde fuera.
- El sitio usa únicamente `/subscription/form`.
- Traefik limita esa ruta a 10 envíos por minuto por IP.

Rutas públicas que Traefik deja pasar al subdominio:
- `/subscription/*`: formulario, confirmación, preferencias y baja.
- `/api/public/captcha/altcha`: el reto de ALTCHA.
- `/campaign/*`: ver el correo en el navegador.
- `/admin` y `/api` (salvo el endpoint bloqueado): el panel, protegido por usuario y contraseña.
- `/uploads`: imágenes de los correos.

## Flujo de cada artículo nuevo

1. Carlos fusiona el PR que agrega `src/content/posts/NN-slug.md`.
2. El despliegue publica el sitio y comprueba que responde, igual que hoy.
3. Un paso nuevo compara los artículos antes y después del merge. Por cada artículo nuevo, llama a la API de Listmonk con un usuario de API de permisos mínimos (crear campañas y enviar pruebas). Ese paso:
   - crea una campaña **borrador** con asunto (título), resumen (dek), imagen y botón "Leer el artículo", con la plantilla de la marca;
   - envía la **vista previa** a `info@opencivicsolutions.org`.
4. Carlos revisa el correo de prueba, entra al panel y pulsa **Enviar**. Si no lo hace, no sale nada.
5. Si el artículo ya tiene campaña (por ejemplo, porque se volvió a desplegar), no se crea otra.

## Boletines propios

Carlos crea una campaña en el panel con la plantilla de la marca y la envía a la lista.

## Privacidad y seguridad

- Se pide **solo el correo**.
- `privacy.disable_tracking = true`: sin píxel de apertura ni enlaces de rastreo.
- `privacy.record_optin_ip = false`: no se guarda la IP de quien confirma.
- Quien se suscribe puede **exportar o borrar** sus datos desde su página de preferencias (`allow_export` y `allow_wipe`).
- `security.trusted_urls` contiene solo `https://opencivicsolutions.org` y la página de confirmación: es lo que permite el redireccionamiento `next` y el reto ALTCHA entre dominios.
- Panel con usuario administrador y contraseña larga.
- Junto al formulario va un texto corto: qué se guarda, para qué y cómo darse de baja.
- Copia diaria de la base de datos (`pg_dump`) en el VPS, con 14 días de retención. Cifrarla en el mismo servidor que guarda la clave no añadiría protección; una copia fuera del VPS queda para más adelante.

## Lo que hace Carlos (guiado paso a paso)

1. Crear el buzón `boletin@opencivicsolutions.org` en hPanel.
2. Agregar el registro DNS `A  boletin  →  179.236.66.237`.
3. Dejar la contraseña del buzón en el servidor de forma segura, sin pegarla en el chat.

## Fuera de alcance

- Varias listas por tema o idioma.
- Envío masivo con un proveedor dedicado (SES o similar). Si la lista supera el límite diario de Hostinger, se cambia el método de envío sin perder la lista.
- Importar suscriptores de otro sitio.

## Cómo se prueba

- **En local**, con Docker y un servidor SMTP de prueba (Mailpit):
  - suscribirse, confirmar y darse de baja;
  - que el formulario sin ALTCHA sea rechazado;
  - que `/api/public/subscription` devuelva 403 detrás de Traefik.
- **El script de campañas**, con un artículo de prueba:
  - crea un único borrador aunque se ejecute dos veces;
  - envía la vista previa.
- **En producción**, antes de anunciarlo: Carlos se suscribe con su propio correo y comprueba que la confirmación no llega a spam.

## Riesgos

- **Límite diario de envío del correo de Hostinger:** hay que verificar la cifra exacta en hPanel antes del primer envío grande.
- **Que caiga en spam:** SPF, DKIM (`hostingermail-a/b/c`) y DMARC ya están publicados. DMARC está en `p=none` y se puede endurecer después.
- **Bots en el formulario:** se mitigan con ALTCHA, el campo trampa (`nonce`) y el límite de frecuencia de Traefik.
