// Metadatos de SEO/Open Graph por ruta. Lo usan tanto las páginas en el
// navegador (para mantener <title> correcto al navegar del lado del
// cliente) como el script de pre-renderizado (scripts/prerender.mjs),
// que es Node puro y por eso este archivo no puede importar nada de React.

export const SITE_URL = 'https://opencivicsolutions.org';
export const SITE_NAME = 'OpenCivic Solutions';
export const DEFAULT_DESCRIPTION =
  'OpenCivic Solutions construye tecnología cívica abierta y verificable: herramientas para cooperar, deliberar y decidir juntos por la paz social y el bien común.';
export const DEFAULT_IMAGE = '/og-default.png';

// Rutas que existen de verdad y por lo tanto se pre-renderizan con su
// propio <title>/<meta>. Cualquier otra ruta debe devolver 404.
export const PAGES = {
  '/': {
    title: 'OpenCivic Solutions — Las instituciones también son tecnología',
    description: DEFAULT_DESCRIPTION,
  },
  '/sobre': {
    title: 'Qué es OpenCivic Solutions — Por qué existimos',
    description: 'La razón de ser, la fórmula de cuatro piezas y los 25 principios de OpenCivic Solutions.',
  },
  '/blog': {
    title: 'Blog y boletín — OpenCivic Solutions',
    description: 'Artículos e informes de OpenCivic Solutions, siempre con fuentes verificables.',
  },
  '/proyectos': {
    title: 'Proyectos — OpenCivic Solutions',
    description: 'Hash Republic Protocol, el Observatorio de preparación cuántica de Bitcoin, BitCuant, Nicaragua Decide y más.',
  },
  '/unirse': {
    title: 'Unirse — Cómo contribuir a OpenCivic Solutions',
    description: 'Hay lugar para quien programa, investiga, diseña, traduce o enseña.',
  },
  '/contacto': {
    title: 'Información y contacto — OpenCivic Solutions',
    description: 'Confianza, licencias y canales oficiales de OpenCivic Solutions.',
  },
  '/proyectos/hash-republic-protocol': {
    title: 'Hash Republic Protocol — Dashboard',
    description: 'Observabilidad del consenso, delegación líquida y reputación acotada para comunidades abiertas.',
  },
};

export function getPageMeta(pathname) {
  const page = PAGES[pathname];
  if (!page) return null;
  return {
    title: page.title,
    description: page.description,
    image: page.image || DEFAULT_IMAGE,
    url: SITE_URL + pathname,
  };
}

export function getPostMeta(post) {
  return {
    title: `${post.title} — Blog de ${SITE_NAME}`,
    description: post.dek,
    image: post.ogImage || post.image || DEFAULT_IMAGE,
    url: `${SITE_URL}/blog/${post.slug}`,
  };
}
