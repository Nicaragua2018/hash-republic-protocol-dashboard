// Revisiones del contenido del blog. Corren en CI (npm test) para que un error
// en el calendario semanal se detecte antes de publicar, no después.
//
// publicados y pendientes: artículos ya leídos con parsePost.
// destacados: slugs que Inicio muestra. proximos: el calendario (proximos.js).
export function validarContenido({ publicados, destacados, proximos, pendientes }) {
  const problemas = [];
  const slugs = new Set(publicados.map((a) => a.slug));
  const titulos = new Set(publicados.map((a) => a.title));

  for (const slug of destacados) {
    if (!slugs.has(slug)) problemas.push(`Inicio destaca «${slug}», que no está publicado`);
  }

  for (const p of proximos) {
    if ((p.slug && slugs.has(p.slug)) || titulos.has(p.titulo)) {
      problemas.push(`«${p.titulo}» ya está publicado: quítalo de Próximamente`);
    }
    if (p.slug && !pendientes.some((a) => a.slug === p.slug)) {
      problemas.push(`«${p.titulo}» vuelve el ${p.fecha}, pero no está en blog-pendientes/`);
    }
  }

  for (const a of pendientes) {
    const programado = proximos.find((p) => p.fecha === a.date);
    if (!programado) {
      problemas.push(`${a.file}: no hay ningún artículo programado para el ${a.date}`);
    } else {
      if (programado.titulo !== a.title) {
        problemas.push(`${a.file}: el título no coincide con el calendario («${programado.titulo}»)`);
      }
      if (programado.slug && programado.slug !== a.slug) {
        problemas.push(`${a.file}: la dirección no coincide con el calendario (${programado.slug})`);
      }
    }
    if (!a.aiAssisted) problemas.push(`${a.file}: falta «ia: asistido» en la cabecera`);
  }

  return problemas;
}
