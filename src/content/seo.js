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
  '/blog/suscripcion': {
    title: 'Revisa tu correo — Boletín de OpenCivic Solutions',
    description:
      'Confirma tu suscripción al boletín de OpenCivic Solutions desde el mensaje que te enviamos.',
    // Página de respuesta del formulario: no se indexa ni va en sitemap.xml.
    noindex: true,
  },
  '/proyectos': {
    title: 'Proyectos — OpenCivic Solutions',
    description:
      'Nicaragua Decide, el proyecto en desarrollo de OpenCivic Solutions: consultas cívicas para el exilio y la diáspora nicaragüense, con protección de identidad.',
  },
  '/unirse': {
    title: 'Unirse — Cómo contribuir a OpenCivic Solutions',
    description: 'Hay lugar para quien programa, investiga, diseña, traduce o enseña.',
  },
  '/contacto': {
    title: 'Información y contacto — OpenCivic Solutions',
    description: 'Confianza, licencias y canales oficiales de OpenCivic Solutions.',
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
    noindex: Boolean(page.noindex),
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

// ── Datos estructurados (JSON-LD) ──────────────────────────────────────
// Los buscadores y los asistentes de IA leen estos bloques para saber
// quién publica el sitio y qué es cada artículo, sin tener que ejecutar
// JavaScript. scripts/prerender.mjs los inserta en cada página.

export const SITE_LANGUAGE = 'es';
export const SITE_LOGO = '/opencivic-icono-512.png';
export const SITE_SAME_AS = ['https://github.com/Nicaragua2018/hash-republic-protocol-dashboard'];

// Firma colectiva: un artículo firmado así lo publica la organización.
const COLLECTIVE_AUTHORS = ['equipo opencivic', 'opencivic solutions'];

const ORG_ID = `${SITE_URL}/#organizacion`;
const WEBSITE_ID = `${SITE_URL}/#sitio`;

const absolute = (path) => (path.startsWith('http') ? path : SITE_URL + path);

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL + '/',
    logo: absolute(SITE_LOGO),
    description: DEFAULT_DESCRIPTION,
    sameAs: SITE_SAME_AS,
  };
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL + '/',
    inLanguage: SITE_LANGUAGE,
    publisher: { '@id': ORG_ID },
  };
}

function authorJsonLd(author) {
  if (!author || COLLECTIVE_AUTHORS.includes(author.trim().toLowerCase())) return { '@id': ORG_ID };
  return { '@type': 'Person', name: author };
}

// Grafo para una página fija del sitio.
export function pageJsonLd(pathname) {
  const meta = getPageMeta(pathname);
  const graph = [organizationJsonLd(), websiteJsonLd()];
  if (meta) {
    graph.push({
      '@type': pathname === '/sobre' ? 'AboutPage' : pathname === '/contacto' ? 'ContactPage' : 'WebPage',
      '@id': meta.url,
      url: meta.url,
      name: meta.title,
      description: meta.description,
      inLanguage: SITE_LANGUAGE,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

// Grafo para un artículo del blog. `sources` son los enlaces de su
// sección "## Fuentes", que se declaran como citas.
export function postJsonLd(post, sources = []) {
  const meta = getPostMeta(post);
  const article = {
    '@type': 'BlogPosting',
    '@id': `${meta.url}#articulo`,
    mainEntityOfPage: meta.url,
    url: meta.url,
    headline: post.title,
    description: post.dek,
    image: absolute(meta.image),
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: SITE_LANGUAGE,
    author: authorJsonLd(post.author),
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
  const citations = sources.filter((s) => /^https?:\/\//.test(s));
  if (citations.length) article.citation = citations;
  return { '@context': 'https://schema.org', '@graph': [organizationJsonLd(), websiteJsonLd(), article] };
}

// JSON dentro de <script>: "<" escapado para que ningún texto pueda cerrar
// la etiqueta antes de tiempo.
export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
