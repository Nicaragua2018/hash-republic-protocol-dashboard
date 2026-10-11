# OpenCivic Solutions — sitio web

Código del sitio [opencivicsolutions.org](https://opencivicsolutions.org): la
presentación de OpenCivic Solutions, su blog (artículos en
`src/content/posts/*.md`) y el dashboard del Hash Republic Protocol, una capa
de observabilidad del consenso para comunidades abiertas.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker compose up -d --build
```

Sirve la build de producción con Nginx en `http://localhost:8080`.
