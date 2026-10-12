# Suscripción al blog y boletín — diseño

Fecha: 11 de octubre de 2026 · Versión 2.1 (incorpora la revisión de Carlos y sus respuestas: correo gratuito, clave en gestor de contraseñas) · Estado: pendiente de que Carlos apruebe esta versión

## Objetivo

Que cualquier persona pueda dejar su correo en el blog, confirmar que es suyo y recibir los artículos nuevos, y que Carlos pueda escribir boletines propios.

**Ningún correo a la lista sale sin la aprobación de Carlos, aunque se filtre una credencial del sistema.**

Como parte de los lectores pueden estar en el exilio o en riesgo:

- la lista de suscriptores es un dato sensible y se guarda en el servidor de OpenCivic, no en un servicio de terceros;
- **nadie debe poder averiguar, desde fuera, si un correo está en la lista**.

## Decisiones tomadas

| Tema                     | Decisión                                                                                            | Origen      |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------- |
| Dónde vive la lista      | Listmonk 6.2 autoalojado en el VPS                                                                  | Carlos      |
| Correos por artículo     | Se genera un borrador solo; Carlos lo autoriza                                                      | Carlos      |
| Boletines propios        | Sí, escritos por Carlos en Listmonk                                                                 | Carlos      |
| Envío                    | SMTP del correo de Hostinger, buzón `boletin@opencivicsolutions.org`                                | Diseño v1   |
| Panel                    | `boletin.opencivicsolutions.org`                                                                    | Diseño v1   |
| Datos que se piden       | Solo el correo                                                                                      | Diseño v1   |
| Rastreo                  | Ninguno: ni aperturas ni clics                                                                      | Diseño v1   |
| Entrada pública          | Un "portero" propio delante de Listmonk (ver abajo)                                                 | Revisión v2 |
| Credencial de borradores | Solo en el VPS; GitHub no tiene token de Listmonk                                                   | Revisión v2 |
| Copias                   | Cifradas con `age`; clave privada solo en poder de Carlos; copia fuera del VPS en Backblaze B2      | Revisión v2 |
| Plan de correo           | Gratuito de Hostinger: **100 correos al día**, repartidos como indica "Presupuesto diario de envío" | Carlos      |
| Clave privada `age`      | En el gestor de contraseñas de Carlos                                                               | Carlos      |

## Lo que se verificó antes de escribir esta versión

Todo lo siguiente se comprobó en el código de Listmonk **v6.2.0** (commit `ef0a758`) y con una instancia local de Listmonk 6.2, PostgreSQL 17 y Mailpit, el 11 de octubre de 2026.

| Pregunta                                                       | Resultado                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ¿ALTCHA protege todas las vías de suscripción?                 | **No.** Solo `POST /subscription/form`. `POST /api/public/subscription` no comprueba el captcha (`cmd/public.go`).                                                                                                                                                                                                   |
| ¿Listmonk limita los correos de confirmación por destinatario? | **No.** Si el correo ya existe, vuelve a enviar la confirmación en cada envío del formulario (`UpdateSubscriberWithLists` → `SendOptinConfirmation`). Prueba: 5 envíos seguidos al mismo correo produjeron **5 correos**.                                                                                            |
| ¿Traefik puede limitar por correo destino?                     | **No.** Su `ratelimit` agrupa por IP, por cabecera o por host, nunca por un campo del cuerpo del formulario.                                                                                                                                                                                                         |
| ¿La respuesta revela si alguien ya está suscrito?              | **Sí**, sin el parámetro `next`. Un correo nuevo, o uno sin confirmar o dado de baja, recibe "Se le ha enviado un correo…". Uno **ya confirmado** o **bloqueado** recibe "Suscrito correctamente".                                                                                                                   |
| ¿Y con un `next` de confianza?                                 | Todas las situaciones responden igual (303 a la misma URL). Solo un correo con formato inválido responde 400, y eso no depende de la lista.                                                                                                                                                                          |
| ¿Hay diferencia de tiempo de respuesta?                        | En local no (mediana de 175 ms frente a 185 ms), pero el aviso se envía con `Push` al mensajero de correo. Con el SMTP real de Hostinger no está medido; el diseño lo neutraliza igualmente (ver "Portero").                                                                                                         |
| ¿Un rol puede crear campañas sin poder enviarlas?              | **Sí.** Pasar una campaña a "running" o "scheduled" exige `campaigns:send` (`PUT /api/campaigns/:id/status`). Pero `campaigns:manage` permite **enviar "pruebas"** con asunto, remitente y contenido libres a cualquier suscriptor de las listas a las que el rol tiene acceso. Por eso el rol por sí solo no basta. |
| ¿Listmonk limita los intentos de inicio de sesión?             | **No** hay bloqueo ni límite en `/admin/login`.                                                                                                                                                                                                                                                                      |
| ¿Tiene doble factor y OIDC?                                    | **Sí, los dos.** TOTP (`/admin/login/twofa`, librería `pquerna/otp`) y OIDC (`/auth/oidc`).                                                                                                                                                                                                                          |
| ¿Hostinger permite boletines desde el buzón?                   | **Sí**, si los suscriptores dieron su consentimiento expreso, hay enlace de baja y se respetan los límites. Puede bloquear buzones que no lo cumplan ([política](https://www.hostinger.com/support/1583510-can-i-send-newsletters)).                                                                                 |

## Arquitectura

```
Visitante ─► opencivicsolutions.org/blog  (formulario + widget ALTCHA)
               │ GET  /boletin/altcha     ──► Listmonk  /api/public/captcha/altcha
               │ POST /boletin/suscribir  ──► PORTERO ──(en segundo plano)──► Listmonk /subscription/form
               ▼                                   │
          303 → /blog/suscripcion                  └─ límite por destinatario y límite global

boletin.opencivicsolutions.org ─► Traefik ─► Listmonk 6.2 (panel de Carlos, con TOTP) ─► PostgreSQL 17
                                     │                  └─► SMTP Hostinger (boletin@) ─► buzones
                                     └─ bloquea: /api/public/subscription, POST /subscription/form,
                                        y cualquier /api con cabecera "Authorization: token …"

Despliegue (script del VPS, ya existente) ─► contenedor efímero en la red interna ─► API de Listmonk
                                              (crea el borrador y envía la vista previa a info@)

Copia diaria: pg_dump ─► age (clave pública) ─► VPS (14 días) + Backblaze B2 (90 días)
```

### Componentes

1. **Listmonk 6.2** y **PostgreSQL 17**: dos servicios nuevos en `docker-compose.yml`, con volumen propio. Los secretos viven en el `.env` del servidor.
2. **Portero del boletín**: un servicio propio, pequeño (alrededor de 120 líneas de Python con solo la biblioteca estándar), que es la única entrada pública para suscribirse.
3. **Formulario** en `/blog` y al final de cada artículo, con el widget ALTCHA (paquete npm `altcha`, servido desde el propio sitio), y una página `/blog/suscripcion` con el mensaje único de respuesta.
4. **Script de borradores**, ejecutado por el script de despliegue del VPS.
5. **Copia de seguridad diaria** cifrada, local y fuera del VPS.

## 1. Suscripción y límite por destinatario

### Por qué un portero

Listmonk no limita por destinatario (verificado), Traefik tampoco puede hacerlo y la respuesta de Listmonk revela si alguien está suscrito. La alternativa más simple que resuelve los tres problemas es un intermediario propio que:

1. **Recibe** el formulario del blog en `POST /boletin/suscribir`, en el mismo dominio del sitio, sin CORS.
2. **Responde siempre igual y de inmediato**: `303` a `/blog/suscripcion`, sea el correo nuevo, confirmado, dado de baja, bloqueado o inválido. Responde **antes** de hablar con Listmonk, así el tiempo de respuesta tampoco revela nada.
3. **Reenvía en segundo plano** a Listmonk (`/subscription/form`, por la red interna de Docker) el correo, la lista y la solución de ALTCHA. Listmonk verifica el ALTCHA como siempre.
4. **Limita por destinatario**: como máximo **1 correo de confirmación por dirección cada 24 horas**. Lo que guarda es un HMAC de la dirección con una clave aleatoria que se crea al arrancar y vive solo en memoria. Así el portero no forma una segunda lista de correos; si se reinicia, los contadores empiezan de cero.
5. **Solo cuenta los envíos que Listmonk aceptó** (ALTCHA válido). Un bot sin ALTCHA válido no puede gastar el cupo de una persona y bloquearle la suscripción.
6. **Límite global**: como máximo **20 confirmaciones en 24 horas móviles**, el cupo reservado para confirmaciones en el presupuesto diario. Protege el cupo de Hostinger aunque el ataque use muchas IPs y muchas direcciones. Al llegar al límite, el portero sigue respondiendo lo mismo pero no reenvía, y anota el total en su registro.
7. No escribe correos en sus registros, solo totales.

El mensaje único de `/blog/suscripcion` dice: "Si el correo es válido y no estaba suscrito, en unos minutos recibirás un mensaje para confirmar. Revisa también la carpeta de spam."

### Límites en Traefik, por IP

- `/boletin/suscribir`: 10 por minuto por IP.
- `/boletin/altcha`: 30 por minuto por IP.

Corrección respecto a la versión anterior: el límite de Traefik es **por IP**, no "por persona". El límite **por destinatario** lo pone el portero.

### Flujo

1. La persona escribe su correo. El navegador resuelve el ALTCHA, una prueba de trabajo de unos segundos, sin terceros.
2. El portero responde 303 a `/blog/suscripcion` y reenvía a Listmonk en segundo plano.
3. Listmonk crea la suscripción en la lista "Blog OpenCivic", que es de **doble confirmación**, y envía "Confirma tu suscripción".
4. Solo quien hace clic queda suscrito. Cada correo lleva enlace de baja y la cabecera `List-Unsubscribe`.

### Lo que Traefik bloquea desde fuera, en `boletin.`

- `POST /api/public/subscription`: sin captcha y revelaría el estado.
- `POST /subscription/form`: solo el portero llega a esta ruta, por la red interna.
- Cualquier petición a `/api/*` con cabecera `Authorization: token …`: los tokens de API solo sirven dentro del servidor.

Siguen accesibles:

- `/subscription/optin/*`, `/subscription/*` (preferencias y baja) y `/campaign/*` (ver el correo en el navegador);
- `/uploads`;
- `/admin` y la API con sesión del navegador, para el panel.

## 2. Borradores de artículos sin token en GitHub

### Rediseño

GitHub Actions **no guarda ninguna credencial de Listmonk**. El despliegue ya funciona con una llave SSH limitada a un único comando en el VPS (`/usr/local/bin/opencivic-deploy.sh`), que no puede ejecutar otra cosa. Después de `git pull` y `docker compose up`, ese mismo script:

1. Compara los artículos antes y después del `pull`: `git diff --name-only --diff-filter=A <antes> <después> -- src/content/posts/`.
2. Por cada artículo nuevo, lanza un contenedor efímero en la red interna de Docker. Ese contenedor llama a `http://listmonk:9000/api` con el usuario de API **`borradores`**, cuyo token vive solo en el `.env` del VPS.
3. Crea la campaña borrador, que se llama `articulo:<slug>` para no duplicarla, con la plantilla de la marca, y envía la vista previa.

### El rol `borradores`

- Permisos: `campaigns:get`, `campaigns:manage` y `templates:get`. **Sin** `campaigns:send` y **sin** ningún permiso `subscribers:*`.
- Acceso a listas: **solo** a la lista privada **"Revisión"**, cuyo único suscriptor es `info@opencivicsolutions.org`. **Ningún acceso** a "Blog OpenCivic".

Consecuencias:

- El borrador se crea dirigido a "Revisión". Para enviarlo, Carlos cambia la lista a **"Blog OpenCivic"** en el panel y pulsa Enviar. Es un clic más, y es justamente la aprobación.
- Si el token se filtrara, solo podría crear borradores y enviar "pruebas" a `info@`:
  - no puede iniciar campañas (le falta `campaigns:send`);
  - no puede ver ni alcanzar a los suscriptores del blog (no tiene acceso a esa lista);
  - desde internet no sirve, porque Traefik rechaza las peticiones con token.
- La única forma de llegar a la lista es con la sesión de Carlos en el panel, protegida con contraseña y TOTP.

## 3. Protección del panel

- **Límite de intentos en Traefik**, por IP, en `/admin/login`, `/admin/login/twofa`, `/admin/forgot` y `/admin/reset`: **5 por minuto**, con ráfaga de 5. Listmonk no tiene límite propio (verificado).
- **Doble factor TOTP obligatorio** para la cuenta de Carlos, con una app como Aegis, Google Authenticator o 1Password. **Recomendado**, porque:
  - viene incluido en Listmonk 6.2;
  - no depende de terceros;
  - sigue funcionando aunque se caiga el proveedor de identidad.
- **OIDC (por ejemplo, entrar con Google): no por ahora.** Hoy hay un único administrador. OIDC añadiría una dependencia externa y haría que la seguridad del panel dependiera de la de esa cuenta. Conviene cuando haya más de una persona administrando.
- Contraseña del administrador: generada, de más de 20 caracteres y guardada en el gestor de contraseñas de Carlos.

## 4. Copias de seguridad

- **Cifrado de clave pública con [`age`](https://age-encryption.org)**:
  - Carlos genera el par de claves **en su propia PC**;
  - el VPS recibe **solo la clave pública**, así que puede cifrar copias pero no leerlas;
  - la clave privada queda fuera del servidor, en el **gestor de contraseñas** de Carlos.
  - Si el VPS cae en manos ajenas, las copias guardadas allí siguen ilegibles.
- **Cada día**: `pg_dump` de la base de Listmonk, cifrado con `age` y guardado en el VPS durante 14 días.
- **Copia fuera del VPS en Backblaze B2**, dentro del alcance:
  - los primeros 10 GB son gratuitos ([precios](https://www.backblaze.com/cloud-storage/pricing)) y la copia diaria pesa kilobytes, así que el costo esperado es 0 USD;
  - se sube con una llave limitada a ese único bucket y con permisos **solo de escritura**: sin `readFiles` ni `deleteFiles` ([capacidades](https://www.backblaze.com/docs/cloud-storage-application-key-capabilities));
  - un intruso en el VPS no podría ni leer ni borrar las copias anteriores;
  - una regla del bucket borra las de más de 90 días.
- **Prueba de restauración** al montar el sistema y luego cada tres meses: Carlos descifra la última copia en su PC con su clave privada y se restaura en una instancia local.

## 5. Enumeración de suscriptores

- **Riesgo verificado**: sin mitigación, la página de Listmonk revela si un correo ya estaba confirmado (ver la tabla de verificación).
- **Mitigación**:
  - el portero responde siempre lo mismo, con el mismo código, el mismo destino y sin esperar a Listmonk;
  - los endpoints que revelan el estado están bloqueados desde fuera;
  - a Listmonk se le configura además un `next` de confianza, como segunda capa.
- **Riesgo residual**: quien controle el buzón de la víctima ve si le llega una confirmación, pero quien controla ese buzón ya puede saber si recibe el boletín.

## Boletines propios

Carlos crea una campaña en el panel con la plantilla de la marca, elige la lista "Blog OpenCivic" y la envía.

## Privacidad

- Se pide **solo el correo**.
- `privacy.disable_tracking = true`, `privacy.individual_tracking = false` y `privacy.record_optin_ip = false`.
- La página de preferencias permite **exportar o borrar** los propios datos.
- Junto al formulario va un texto corto: qué se guarda, para qué y cómo darse de baja.

## Envío y entregabilidad

- **Límite de Hostinger**: depende del plan del buzón ([límites](https://www.hostinger.com/support/4625828-parameters-and-limits-of-hostinger-email/)), con un máximo de 100 destinatarios por mensaje. Listmonk envía uno por suscriptor, así que esto no afecta. El límite diario se cuenta en 24 horas móviles:

  | Plan              | Correos por día |
  | ----------------- | --------------- |
  | Business Starter  | 1.000           |
  | Business Standard | 3.000           |
  | Business Premium  | 3.000           |
  | Prueba gratuita   | **100**         |

- **El plan de OpenCivic es el gratuito: 100 correos en 24 horas móviles.** Todo lo que sale del buzón cuenta: confirmaciones, vistas previas y campañas.

### Presupuesto diario de envío

| Uso                               | Cupo en 24 h | Cómo se hace cumplir                                                                            |
| --------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| Campañas (artículos y boletines)  | 70           | Ventana deslizante de Listmonk: `app.message_sliding_window = true`, duración `24h`, ritmo `70` |
| Confirmaciones de suscripción     | 20           | Límite global del portero                                                                       |
| Vistas previas a `info@` y margen | 10           | Una vista previa por artículo; el resto queda libre                                             |
| **Total**                         | **100**      |                                                                                                 |

Consecuencias:

- Mientras la lista tenga **hasta 70 personas confirmadas**, cada campaña sale el mismo día.
- Con más de 70, Listmonk la reparte sola en varios días (70 por cada 24 horas). Por ejemplo, 200 suscriptores tardan unos 3 días.
- **Cuándo pasar a un plan de pago:** cuando la lista supere **70 personas** o cuando un día se agoten las 20 confirmaciones. El plan Business Starter (1.000 al día) basta para crecer mucho; solo cambian los números de esta tabla.
- **DMARC**:
  - Ahora: `p=none` y se añade `rua=mailto:dmarc@opencivicsolutions.org` para recibir informes. Hoy no se recibe ninguno.
  - Se pasa a `p=quarantine` cuando se cumplan **las dos** condiciones:
    1. al menos **4 semanas** de informes con el boletín ya enviando;
    2. que el **98 % o más** de los mensajes legítimos pase SPF o DKIM alineado, sin fuentes legítimas fallando.
  - Fecha de revisión: **15 de diciembre de 2026**.

## Lo que hace Carlos (guiado paso a paso)

1. Crear el buzón `boletin@opencivicsolutions.org` en hPanel y decirme qué plan tiene (hPanel → Correos → Buzones → Ver límites).
2. Agregar el registro DNS `A  boletin  →  179.236.66.237` y el cambio de DMARC.
3. Dejar la contraseña del buzón en el servidor de forma segura, sin pegarla en el chat.
4. Activar TOTP en su cuenta del panel.
5. Generar su par de claves `age` en su PC y guardar la clave privada.
6. Crear la cuenta de Backblaze B2, el bucket y la llave de solo escritura.

## Fuera de alcance

- Varias listas por tema o idioma.
- Un proveedor de envío masivo dedicado. Si la lista supera el cupo del plan, se cambia el método de envío sin perder la lista.
- Importar suscriptores de otro sitio.
- OIDC (ver la sección 3).

## Cómo se prueba

Todo se prueba en local con Docker, Traefik, Listmonk 6.2, el portero y Mailpit antes de tocar producción.

**Suscripción y límite por destinatario (punto 1)**

- Suscribirse, confirmar y darse de baja funciona de principio a fin.
- 5 envíos al mismo correo, desde 5 IPs distintas y con ALTCHA válido: **exactamente 1** correo en Mailpit en 24 horas.
- Envíos sin ALTCHA o con ALTCHA inválido: **0** correos, y no gastan el cupo de esa dirección (luego un envío válido sí llega).
- 21 envíos válidos a direcciones distintas en 24 horas: llegan **20** confirmaciones.
- Una campaña de prueba a una lista de 75 suscriptores de prueba: salen **70** el primer día y **5** al siguiente (con la ventana reducida para la prueba, por ejemplo 7 cada 10 minutos).
- 11 envíos en un minuto desde la misma IP: el número 11 recibe **429**.

**Token de borradores (punto 2)**

- Con el token `borradores`, dentro de la red interna:
  - crear un borrador para "Revisión": funciona;
  - `PUT /api/campaigns/:id/status` a `running` o `scheduled`: **403**;
  - prueba a un correo suscrito a "Blog OpenCivic": rechazada;
  - prueba a `info@`: llega;
  - leer suscriptores: **403**.
- El mismo token desde fuera, a través de Traefik: **403**.
- Ejecutar dos veces el script con el mismo artículo: **un único** borrador.

**Enumeración (punto 5)**

- A través del portero, comparar un correo nuevo, uno sin confirmar, uno confirmado, uno dado de baja, uno bloqueado y uno inválido: **mismo código (303), mismo destino y mismo cuerpo**.
- Mediana de tiempo de respuesta de 20 envíos por caso: diferencia entre casos **menor a 20 ms**.
- `POST /api/public/subscription` y `POST /subscription/form` desde fuera: **403**.

**Panel y copias**

- 6 intentos de login en un minuto desde la misma IP: el número 6 recibe **429**.
- Con TOTP activado, entrar sin código falla.
- La copia diaria aparece en el VPS y en B2. Con la llave del VPS, leer o borrar en B2 falla. Carlos descifra la copia en su PC y se restaura bien.

**En producción, antes de anunciarlo**

- Carlos se suscribe con su propio correo y comprueba que la confirmación no cae en spam.
- Se repite el caso de enumeración contra el SMTP real de Hostinger.

## Riesgos residuales aceptados

- **Confirmaciones agotadas por un ataque:** un ataque distribuido con ALTCHA resuelto puede gastar las 20 confirmaciones del día. Ese día, las personas reales que se suscriban verán el mensaje habitual pero no recibirán confirmación, y tendrán que intentarlo al día siguiente. **Las campañas no se ven afectadas**, porque tienen su propio cupo de 70. Mitigaciones: ALTCHA, el límite por IP y el registro de totales del portero.
- **Campañas lentas mientras el plan sea gratuito:** con más de 70 suscriptores, cada campaña tarda varios días en llegar a todos.
- **Prueba gratuita del correo:** si el buzón está en una prueba de Hostinger (de 30 días o de 1 año), al vencer deja de enviar. Hay que comprobar la fecha en hPanel.
- **Una confirmación por dirección cada 24 horas:** un atacante puede hacer que una persona reciba **una** confirmación no pedida al día. Es inevitable con doble confirmación y no la suscribe a nada.
- **Contadores en memoria:** si el portero se reinicia, una dirección podría recibir una segunda confirmación ese mismo día.
- **Quien controle el buzón de alguien** ve si le llega una confirmación (ver el punto 5).
- **Pérdida de la clave privada `age`:** vive solo en el gestor de contraseñas de Carlos. Si pierde el acceso a ese gestor, las copias cifradas no se pueden leer. Depende de que el gestor tenga su propia sincronización o copia y su método de recuperación.
- **Compromiso total del VPS:** quien tenga control del servidor tiene la lista viva. Las copias en B2 siguen protegidas.

## Preguntas abiertas para Carlos

1. ¿El correo gratuito es una **prueba** con fecha de vencimiento (de 30 días o de 1 año) o un plan gratuito sin vencimiento? Se ve en hPanel → Correos. Si vence, hay que decidir antes de lanzar si se pasa a Business Starter.

Resueltas el 11 de octubre de 2026: plan de correo gratuito (100 al día); clave privada `age` en el gestor de contraseñas.
