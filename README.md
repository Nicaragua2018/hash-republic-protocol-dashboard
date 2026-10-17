# OpenCivic Solutions — sitio web

Código de [opencivicsolutions.org](https://opencivicsolutions.org): la presentación de OpenCivic Solutions, su proyecto Nicaragua Decide, el blog con su boletín y HONEY, el asistente del sitio.

El panel técnico de Hash Republic Protocol que antes vivía aquí quedó archivado en la etiqueta [`archivo-panel-hrp`](https://github.com/Nicaragua2018/hash-republic-protocol-dashboard/tree/archivo-panel-hrp).

## Qué hay en el repositorio

| Carpeta                 | Qué es                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/`                  | El sitio: React 19 + Vite. Páginas en `src/pages/`, artículos en `src/content/posts/`                                |
| `blog-pendientes/`      | Artículos ya escritos que esperan su lunes de publicación                                                            |
| `boletin/`              | El boletín: Listmonk, el portero que recibe las suscripciones, los borradores por artículo y las copias de seguridad |
| `honey/`                | HONEY, el asistente del sitio (Python + Claude Haiku 5.5). Ver [`honey/README.md`](honey/README.md)                  |
| `deploy/`               | El script que despliega en el VPS                                                                                    |
| `docs/`                 | Diseños, planes de trabajo y el paper completo sobre la modernización de las instituciones                           |
| `scripts/prerender.mjs` | Genera las páginas estáticas, el sitemap y el RSS después del build                                                  |

## Desarrollo

```bash
npm install
npm run dev        # sitio en http://localhost:5173
npm test           # pruebas del sitio y del contenido del blog
npm run lint
npm run build
```

Las pruebas de HONEY y del boletín son de Python; cada carpeta explica cómo correrlas.

## El blog, cada semana

Se publica un artículo cada lunes. El calendario está en `src/content/proximos.js` y se muestra en el Blog como «Próximamente».

1. El artículo se escribe en `blog-pendientes/AAAA-MM-DD-slug.md`, con la misma fecha y título que en el calendario. Carlos lo revisa.
2. El lunes, un PR lo mueve a `src/content/posts/` y quita su entrada de `proximos.js`.
3. Al desplegar, cada archivo nuevo en `src/content/posts/` genera un borrador de boletín que Carlos autoriza antes del envío.

`npm test` comprueba que el calendario, los pendientes y los artículos de Inicio (`src/content/destacados.js`) coincidan. No renombres archivos de artículos ya publicados: el despliegue los tomaría como nuevos y crearía borradores de boletín de más.

## Publicación

Todo cambio entra por un PR. Al unirlo en `master`, GitHub Actions corre formato, lint, pruebas y build, y despliega en el VPS: `docker compose up -d --build` detrás de Traefik.

La pila completa (sitio, comentarios, boletín y HONEY) se puede probar en local con `boletin/local/compose.local.yml`.
