# Propuestas de mejora

Ideas para próximas versiones de opencivicsolutions.org. Ninguna está diseñada ni aprobada todavía: cada una necesita su propio diseño (`docs/superpowers/specs/`) y el visto bueno de Carlos antes de construirse.

---

## 1. Formulario de contacto con respuesta por correo

_Propuesta del 2026-11-13 (Carlos)._

### Por qué

Hoy la página `/contacto` ofrece WhatsApp y un botón para copiar `info@opencivicsolutions.org` (PR #33). Se quitaron los enlaces `mailto:` porque no abren nada en computadoras sin programa de correo configurado. Un formulario dentro del sitio permitiría escribir sin salir de la página y sin depender del programa de correo de cada persona.

### Qué haría

La persona escribe **su mensaje** y **su correo** (para recibir la respuesta) y pulsa «Enviar». El mensaje llega a `info@opencivicsolutions.org` con el correo de la persona como dirección de respuesta (`Reply-To`), de modo que responder sea un clic desde el buzón. La página confirma: «Recibimos tu mensaje, te responderemos pronto».

Campos:

| Campo                   | Obligatorio | Notas                                                                |
| ----------------------- | ----------- | -------------------------------------------------------------------- |
| Mensaje                 | Sí          | Texto libre, con un tope de longitud (por ejemplo 2.000 caracteres). |
| Correo para responderte | Sí          | Se valida el formato; no se suscribe a nadie al boletín.             |
| Nombre                  | No          | Opcional; muchas personas prefieren no darlo.                        |

### Cuidados

- **Privacidad:** el mensaje se reenvía y no se guarda en una base de datos del sitio. Las IP no se guardan tal cual: si hace falta limitar envíos, se usa una huella cifrada, como en el resto del sitio. El formulario explica en una línea para qué se usa el correo.
- **Spam y abuso:** un campo trampa invisible para robots, un límite de envíos por huella y por día, y un tope de tamaño. Sin CAPTCHA de terceros que rastreen a la persona.
- **Cupo de correo:** el plan de Hostinger tiene un solo buzón (`info@`) con un límite de envíos cada 24 horas que ya comparten el boletín y el correo normal. El formulario debe tener su propio tope diario para no agotar ese cupo.
- **Sin cuenta ni JavaScript de terceros:** debe funcionar en cualquier navegador y no cargar servicios externos.
- **Accesibilidad:** etiquetas visibles, mensajes de error claros y confirmación que se anuncie a los lectores de pantalla.

### Dónde podría vivir

El sitio ya tiene servicios pequeños detrás de Traefik, por ejemplo `boletin-portero`, que recibe las suscripciones con límites de uso. El formulario podría reutilizar ese patrón: un servicio pequeño, o una ruta nueva en uno existente, que reciba el envío, aplique los límites y mande el correo por el SMTP de Hostinger. La decisión se toma en el diseño.

### Relación con Nicaragua Decide

Nicaragua Decide tiene la misma idea anotada en su `docs/ROADMAP.md` (Iteración 12), con envío por Resend a `admin@nicaraguadecide.org`. Conviene diseñar ambos a la vez para que se comporten igual.

### Fuera del alcance (por ahora)

- Adjuntar archivos.
- Responder desde el propio sitio: las respuestas salen del buzón de correo.
- Que HONEY lea o conteste estos mensajes.
