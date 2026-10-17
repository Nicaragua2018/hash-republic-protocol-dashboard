import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parsePost } from './parsePost.js';
import { validarContenido } from './validar.js';
import PROXIMOS from './proximos.js';
import DESTACADOS from './destacados.js';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const leer = (dir) =>
  readdirSync(raiz + dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(readFileSync(`${raiz}${dir}/${f}`, 'utf8'), `${dir}/${f}`));

const articulo = (slug, title, date, extra = {}) => ({
  slug,
  title,
  date,
  aiAssisted: true,
  file: `${slug}.md`,
  ...extra,
});
const base = () => ({
  publicados: [articulo('uno', 'Uno', '2026-10-11')],
  destacados: ['uno'],
  proximos: [{ fecha: '2026-10-19', titulo: 'Dos', sinopsis: '…' }],
  pendientes: [articulo('dos', 'Dos', '2026-10-19')],
});

test('el contenido real del repositorio no tiene problemas', () => {
  const problemas = validarContenido({
    publicados: leer('src/content/posts'),
    destacados: DESTACADOS,
    proximos: PROXIMOS,
    pendientes: leer('blog-pendientes'),
  });
  assert.deepEqual(problemas, []);
});

test('un caso sano no da problemas', () => {
  assert.deepEqual(validarContenido(base()), []);
});

test('Inicio no puede destacar un artículo que no está publicado', () => {
  const c = base();
  c.destacados.push('fantasma');
  assert.match(validarContenido(c).join('\n'), /fantasma/);
});

test('un artículo publicado no puede seguir en Próximamente', () => {
  const c = base();
  c.publicados.push(articulo('dos', 'Dos', '2026-10-19'));
  c.pendientes = [];
  assert.match(validarContenido(c).join('\n'), /ya está publicado/);
});

test('un pendiente debe coincidir con el calendario en fecha y título', () => {
  const c = base();
  c.pendientes = [articulo('dos', 'Otro título', '2026-10-19')];
  assert.match(validarContenido(c).join('\n'), /título no coincide/);
  c.pendientes = [articulo('dos', 'Dos', '2026-10-20')];
  assert.match(validarContenido(c).join('\n'), /no hay ningún artículo programado/);
});

test('un pendiente necesita la etiqueta de IA', () => {
  const c = base();
  c.pendientes = [articulo('dos', 'Dos', '2026-10-19', { aiAssisted: false })];
  assert.match(validarContenido(c).join('\n'), /ia: asistido/);
});

test('un artículo que vuelve debe esperar en blog-pendientes con su misma dirección', () => {
  const c = base();
  c.proximos[0].slug = 'dos-viejo';
  assert.match(validarContenido(c).join('\n'), /dirección no coincide/);
  c.pendientes = [];
  assert.match(validarContenido(c).join('\n'), /no está en blog-pendientes/);
});
