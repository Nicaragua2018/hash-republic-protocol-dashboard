import { useEffect } from 'react';

// Mantiene <title> y <meta name="description"> correctos cuando el
// usuario navega del lado del cliente (sin recarga). El primer HTML que
// recibe cualquier visita o crawler ya trae estos valores de fábrica
// desde scripts/prerender.mjs — esto solo evita que se queden
// desactualizados tras un <Link> interno.
export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
