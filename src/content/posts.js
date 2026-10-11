// Artículos del blog: cada uno es un archivo Markdown en ./posts/.
// Para publicar uno nuevo basta con agregar un .md (ver el formato en
// parsePost.js); el número al inicio del nombre ordena los del mismo día.

import { parsePost, sortPosts } from './parsePost.js';

const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });

const posts = sortPosts(Object.entries(files).map(([path, raw]) => parsePost(raw, path)));

export default posts;

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}
