// Convierte un artículo en Markdown (src/content/posts/*.md) en el objeto
// que usan las páginas del blog y scripts/prerender.mjs. Es JS puro, sin
// dependencias, para que funcione igual en el navegador y en Node.
//
// Formato admitido, a propósito pequeño:
//   ---                      cabecera con "clave: valor" por línea
//   ## Título de sección   /   ### Subtítulo
//   Párrafos separados por una línea en blanco
//   - elementos de lista
//   ![texto alternativo](/imagen.png)   en su propio párrafo
//   | tabla | con | barras |   (la segunda fila es |---|---|)
//   [texto](https://enlace), **negrita**, *cursiva*
// Una sección "## Fuentes" se muestra como el recuadro de fuentes; dentro,
// los párrafos sueltos sirven de notas o de títulos de grupo.

const SOURCES_HEADING = 'fuentes';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
    if (key) meta[key] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

// [texto](url), **negrita**, *cursiva* → lista de fragmentos
export function parseInline(text) {
  const tokens = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ t: 'text', v: text.slice(last, m.index) });
    if (m[1] !== undefined) {
      const children = parseInline(m[1]);
      tokens.push({ t: 'link', v: inlineToText(children), url: m[2], children });
    } else if (m[3] !== undefined) tokens.push({ t: 'strong', v: m[3] });
    else tokens.push({ t: 'em', v: m[4] });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ t: 'text', v: text.slice(last) });
  return tokens;
}

export function inlineToText(tokens) {
  return tokens.map((tok) => tok.v).join('');
}

const splitRow = (line) =>
  line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => parseInline(cell.trim()));

function parseBody(body) {
  const blocks = [];
  // Todo lo que va después de "## Fuentes" se agrupa en un único recuadro,
  // conservando el orden de notas y listas.
  let sources = null;
  for (const chunk of body.split(/\n\s*\n/)) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    if (lines[0].startsWith('### ') && !sources) {
      blocks.push({ type: 'h3', text: lines.shift().slice(4).trim() });
      if (!lines.length) continue;
    } else if (lines[0].startsWith('## ')) {
      const text = lines[0].slice(3).trim();
      if (text.toLowerCase() === SOURCES_HEADING) {
        sources = { type: 'sources', parts: [] };
        blocks.push(sources);
      } else {
        sources = null;
        blocks.push({ type: 'h2', text });
      }
      lines.shift();
      if (!lines.length) continue;
    }

    const isList = lines.every((l) => l.startsWith('- '));
    if (sources) {
      if (isList) sources.parts.push({ items: lines.map((l) => parseInline(l.slice(2).trim())) });
      else sources.parts.push({ note: parseInline(lines.join(' ')) });
      continue;
    }

    if (isList) {
      blocks.push({ type: 'ul', items: lines.map((l) => parseInline(l.slice(2).trim())) });
      continue;
    }

    const img = lines.length === 1 && lines[0].match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      blocks.push({ type: 'img', alt: img[1], src: img[2] });
      continue;
    }

    if (lines.length >= 2 && lines.every((l) => l.startsWith('|')) && /^\|[\s:|-]+\|$/.test(lines[1])) {
      blocks.push({ type: 'table', head: splitRow(lines[0]), rows: lines.slice(2).map(splitRow) });
      continue;
    }

    blocks.push({ type: 'p', inlines: parseInline(lines.join(' ')) });
  }
  return blocks;
}

export function parsePost(raw, file = '') {
  // Editors on Windows may save with a byte-order mark and CRLF line ends.
  const normalized = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const { meta, body } = parseFrontmatter(normalized);
  for (const required of ['slug', 'title', 'dek', 'date']) {
    if (!meta[required]) throw new Error(`Artículo ${file}: falta "${required}" en la cabecera`);
  }
  // The slug becomes the URL and, in prerender, a file name in dist/: only
  // lowercase letters, digits and hyphens, so it can never point elsewhere.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) {
    throw new Error(
      `Artículo ${file}: el slug "${meta.slug}" solo puede tener minúsculas, números y guiones`
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || Number.isNaN(Date.parse(meta.date))) {
    throw new Error(`Artículo ${file}: la fecha "${meta.date}" debe tener el formato AAAA-MM-DD`);
  }
  return {
    slug: meta.slug,
    title: meta.title,
    dek: meta.dek,
    date: meta.date,
    author: meta.author || 'Equipo OpenCivic',
    image: meta.image || null,
    imageAlt: meta.imageAlt || '',
    ogImage: meta.ogImage || null,
    aiAssisted: meta.ia === 'asistido',
    file: file.split('/').pop(),
    body: parseBody(body),
  };
}

// Más reciente primero; a igual fecha, el archivo con número mayor primero.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.file < b.file ? 1 : -1;
  });
}
