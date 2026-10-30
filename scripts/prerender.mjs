// Corre después de `vite build`. El bundle sigue siendo una SPA normal
// (el <div id="root"> se queda vacío y React la monta igual que siempre);
// lo único que este script genera es, para cada ruta real, su propio
// <title>/<meta>/Open Graph en un archivo .../index.html propio, más
// sitemap.xml, rss.xml y robots.txt. Así, compartir un enlace en
// WhatsApp/X/LinkedIn muestra el título y la imagen correctos, y una URL
// que no existe no tiene carpeta — nginx le responde 404 de verdad.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  PAGES,
  SITE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  getPageMeta,
  getPostMeta,
  pageJsonLd,
  postJsonLd,
  jsonLdScript,
  faqJsonLd,
} from '../src/content/seo.js';
import { parsePost, sortPosts } from '../src/content/parsePost.js';
import PROXIMOS from '../src/content/proximos.js';
import principles from '../src/content/principles.js';
import * as nicaraguaDecide from '../src/content/nicaraguaDecide.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// src/content/posts.js usa import.meta.glob, que solo existe dentro de
// Vite; aquí se leen los mismos .md directamente del disco.
const postsDir = join(__dirname, '..', 'src', 'content', 'posts');
const rawByFile = new Map(
  readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => [f, readFileSync(join(postsDir, f), 'utf8')])
);
const posts = sortPosts([...rawByFile].map(([f, raw]) => parsePost(raw, f)));

// Texto del artículo sin la cabecera, para llms-full.txt.
const postMarkdown = (post) =>
  rawByFile
    .get(post.file)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .trim();

// Enlaces de la sección "## Fuentes" de un artículo ya interpretado.
function sourceUrls(post) {
  const urls = [];
  const walk = (tokens) => {
    for (const tok of tokens || []) {
      if (tok.t === 'link') urls.push(tok.url);
      if (tok.children) walk(tok.children);
    }
  };
  for (const block of post.body) {
    if (block.type !== 'sources') continue;
    for (const part of block.parts) {
      if (part.note) walk(part.note);
      for (const item of part.items || []) walk(item);
    }
  }
  return [...new Set(urls)];
}

// Un artículo no puede usar la URL de una página del sitio (por ejemplo
// /blog/suscripcion): el prerender la pisaría sin avisar.
for (const post of posts) {
  if (PAGES[`/blog/${post.slug}`]) {
    throw new Error(`prerender: el slug "${post.slug}" está reservado por una página del sitio`);
  }
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildSeoBlock({
  title,
  description,
  image,
  url,
  noindex,
  jsonLd,
  ogType = 'website',
  publishedTime,
}) {
  const absImage = image.startsWith('http') ? image : SITE_URL + image;
  return `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" type="text/plain" title="Resumen para asistentes de IA" href="${SITE_URL}/llms.txt" />
    ${noindex ? '<meta name="robots" content="noindex" />' : ''}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:locale" content="es_419" />
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${absImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${absImage}" />
    ${jsonLd ? jsonLdScript(jsonLd) : ''}`;
}

const SEO_BLOCK_RE = /<!--[^>]*SEO_START[^>]*-->[\s\S]*?<!--[^>]*SEO_END[^>]*-->/;

function renderPage(meta) {
  if (!SEO_BLOCK_RE.test(template)) {
    throw new Error('prerender: no se encontró el bloque SEO_START…SEO_END en dist/index.html');
  }
  return template.replace(SEO_BLOCK_RE, buildSeoBlock(meta));
}

function writeRoute(routePath, meta) {
  const html = renderPage(meta);
  if (routePath === '/') {
    writeFileSync(join(distDir, 'index.html'), html);
    return;
  }
  // A flat "<route>.html" file instead of "<route>/index.html": nginx
  // would otherwise 301-redirect "/sobre" to "/sobre/" to serve a
  // directory's index, adding a hop crawlers and share-previews don't
  // always follow. try_files tries "$uri.html" first, so this is
  // served directly at the exact path people link to.
  const filePath = join(distDir, routePath.replace(/^\//, '') + '.html');
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

let count = 0;

// Páginas estáticas conocidas
for (const routePath of Object.keys(PAGES)) {
  const meta = getPageMeta(routePath);
  const extra = routePath === '/proyectos' ? [faqJsonLd(meta.url, nicaraguaDecide.FAQ)] : [];
  writeRoute(routePath, { ...meta, jsonLd: meta.noindex ? null : pageJsonLd(routePath, extra) });
  count++;
}

// Un archivo por artículo del blog
for (const post of posts) {
  writeRoute(`/blog/${post.slug}`, {
    ...getPostMeta(post),
    jsonLd: postJsonLd(post, sourceUrls(post)),
    ogType: 'article',
    publishedTime: post.date,
  });
  count++;
}

// Artículos que vuelven más adelante (src/content/proximos.js con slug):
// su dirección responde con la página "vuelve el …" en vez de un 404, para
// que los enlaces que ya apuntan a ellos no se rompan. No se indexan
// hasta que se publiquen de verdad.
const publishedSlugs = new Set(posts.map((p) => p.slug));
for (const p of PROXIMOS) {
  if (!p.slug || publishedSlugs.has(p.slug)) continue;
  if (PAGES[`/blog/${p.slug}`]) {
    throw new Error(`prerender: el slug próximo "${p.slug}" está reservado por una página del sitio`);
  }
  writeRoute(`/blog/${p.slug}`, {
    title: `${p.titulo} (próximamente) — Blog de ${SITE_NAME}`,
    description: p.sinopsis,
    image: DEFAULT_IMAGE,
    url: `${SITE_URL}/blog/${p.slug}`,
    noindex: true,
  });
  count++;
}

// 404 real, con robots:noindex — nginx la sirve con status 404
writeFileSync(
  join(distDir, '404.html'),
  renderPage({
    title: 'Página no encontrada — OpenCivic Solutions',
    description: 'Esta página no existe o se movió de lugar.',
    image: DEFAULT_IMAGE,
    url: SITE_URL + '/404.html',
    noindex: true,
  })
);

// sitemap.xml
const urls = [
  ...Object.keys(PAGES)
    .filter((p) => !PAGES[p].noindex)
    .map((p) => ({ loc: SITE_URL + p })),
  ...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, lastmod: p.date })),
];
writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`
);

// robots.txt
writeFileSync(join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// rss.xml — un feed simple con los artículos del blog
// `posts` ya viene ordenado (más reciente primero) por sortPosts.
const rssItems = posts
  .map((p) => {
    const meta = getPostMeta(p);
    const pubDate = new Date(p.date + 'T00:00:00Z').toUTCString();
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${meta.url}</link>
    <guid>${meta.url}</guid>
    <description>${escapeXml(p.dek)}</description>
    <pubDate>${pubDate}</pubDate>
  </item>`;
  })
  .join('\n');

writeFileSync(
  join(distDir, 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>Blog de ${SITE_NAME}</title>\n  <link>${SITE_URL}/blog</link>\n  <description>${escapeXml(
    DEFAULT_DESCRIPTION
  )}</description>\n  <language>es</language>\n${rssItems}\n</channel></rss>\n`
);

// llms.txt — índice del sitio para asistentes de IA (formato llmstxt.org):
// qué es OpenCivic y qué hay en cada página, en Markdown simple.
const indexablePages = Object.keys(PAGES).filter((p) => !PAGES[p].noindex);
const llmsTxt = `# ${SITE_NAME}

> ${DEFAULT_DESCRIPTION}

OpenCivic Solutions es una organización de tecnología cívica de código abierto. Su único proyecto en desarrollo es Nicaragua Decide, un laboratorio de consultas cívicas para el exilio y la diáspora nicaragüense, con protección de identidad. Combina cuatro piezas: democracia (el resultado sin ponderar siempre queda a la vista), competencia verificable (un peso adicional de 1,3× como máximo), criptografía (informes con huella digital y sello de tiempo) y constitución (12 principios que ninguna mayoría puede cruzar). Los textos del sitio están en español; se redactan con asistencia de IA y se publican solo con revisión y autorización humana.

## Páginas

${indexablePages.map((p) => `- [${PAGES[p].title}](${SITE_URL}${p}): ${PAGES[p].description}`).join('\n')}

## Blog

${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}) (${p.date}): ${p.dek}`).join('\n')}

## Opcional

- [Texto completo de los artículos y principios](${SITE_URL}/llms-full.txt)
- [Código fuente y documentación técnica en GitHub](https://github.com/Nicaragua2018/hash-republic-protocol-dashboard)
- [Feed RSS del blog](${SITE_URL}/rss.xml)
`;
writeFileSync(join(distDir, 'llms.txt'), llmsTxt);

// llms-full.txt — el contenido completo en texto, porque las páginas se
// montan con JavaScript y muchos rastreadores de IA no lo ejecutan.
const llmsFull = `# ${SITE_NAME} — contenido completo

> ${DEFAULT_DESCRIPTION}

Fuente: ${SITE_URL}/ · Idioma: español

## Nicaragua Decide

Fuente: ${SITE_URL}/proyectos

${nicaraguaDecide.RESUMEN}

### Qué se puede hacer

${nicaraguaDecide.FUNCIONES.map((f) => `- **${f.titulo}.** ${f.texto}`).join('\n')}

### Cómo protege la identidad

${nicaraguaDecide.PROTECCION.map((t) => `- ${t}`).join('\n')}

### Cómo se comprueban los resultados

${nicaraguaDecide.VERIFICACION.map((t) => `- ${t}`).join('\n')}

### Estado

${nicaraguaDecide.ESTADO}

Código abierto: ${nicaraguaDecide.REPO_URL}

### Preguntas frecuentes

${nicaraguaDecide.FAQ.map((q) => `**${q.pregunta}** ${q.respuesta}`).join('\n\n')}

## Los 12 principios de OpenCivic Solutions

Fuente: ${SITE_URL}/sobre

${principles.map((pr, i) => `${i + 1}. **${pr.text}** ${pr.explain}`).join('\n\n')}

${posts
  .map(
    (p) => `---

# ${p.title}

Fuente: ${SITE_URL}/blog/${p.slug} · Autoría: ${p.author} · Publicado: ${p.date}

> ${p.dek}

${postMarkdown(p)}`
  )
  .join('\n\n')}
`;
writeFileSync(join(distDir, 'llms-full.txt'), llmsFull);

console.log(
  `prerender: ${count} rutas, 404.html, sitemap.xml, rss.xml, robots.txt, llms.txt y llms-full.txt generados en dist/`
);
