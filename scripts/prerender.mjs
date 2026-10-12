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

import { PAGES, SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, getPageMeta, getPostMeta } from '../src/content/seo.js';
import { parsePost, sortPosts } from '../src/content/parsePost.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// src/content/posts.js usa import.meta.glob, que solo existe dentro de
// Vite; aquí se leen los mismos .md directamente del disco.
const postsDir = join(__dirname, '..', 'src', 'content', 'posts');
const posts = sortPosts(
  readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(readFileSync(join(postsDir, f), 'utf8'), f))
);

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

function buildSeoBlock({ title, description, image, url, noindex }) {
  const absImage = image.startsWith('http') ? image : SITE_URL + image;
  return `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    ${noindex ? '<meta name="robots" content="noindex" />' : ''}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${absImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${absImage}" />`;
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
  writeRoute(routePath, getPageMeta(routePath));
  count++;
}

// Un archivo por artículo del blog
for (const post of posts) {
  writeRoute(`/blog/${post.slug}`, getPostMeta(post));
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
  ...Object.keys(PAGES).map((p) => ({ loc: SITE_URL + p })),
  ...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, lastmod: p.date })),
];
writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`
);

// robots.txt
writeFileSync(
  join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

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

console.log(
  `prerender: ${count} rutas, 404.html, sitemap.xml, rss.xml y robots.txt generados en dist/`
);
