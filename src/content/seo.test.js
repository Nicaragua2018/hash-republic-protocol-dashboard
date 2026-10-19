import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageJsonLd, postJsonLd, jsonLdScript, SITE_URL } from './seo.js';

const post = {
  slug: 'ejemplo',
  title: 'Ejemplo',
  dek: 'Un artículo de prueba.',
  date: '2026-10-11',
  author: 'Equipo OpenCivic',
  image: '/og-default.png',
};

test('cada página declara la organización y el sitio', () => {
  const types = pageJsonLd('/sobre')['@graph'].map((n) => n['@type']);
  assert.deepEqual(types, ['Organization', 'WebSite', 'AboutPage']);
});

test('un artículo firmado por el equipo lo publica la organización', () => {
  const article = postJsonLd(post)['@graph'][2];
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.url, `${SITE_URL}/blog/ejemplo`);
  assert.deepEqual(article.author, { '@id': `${SITE_URL}/#organizacion` });
  assert.equal(article.citation, undefined);
});

test('un artículo con firma personal la declara como persona y cita sus fuentes', () => {
  const article = postJsonLd({ ...post, author: 'Carlos Robleto' }, ['https://a.org/x', '/blog/interno'])[
    '@graph'
  ][2];
  assert.deepEqual(article.author, { '@type': 'Person', name: 'Carlos Robleto' });
  assert.deepEqual(article.citation, ['https://a.org/x']);
});

test('el JSON-LD no puede cerrar su propia etiqueta <script>', () => {
  const html = jsonLdScript({ name: '</script><b>' });
  assert.equal(html.match(/<\/script>/g).length, 1);
});

test('las preguntas frecuentes se declaran como FAQPage', async () => {
  const { faqJsonLd, pageJsonLd } = await import('./seo.js');
  const faq = faqJsonLd(`${SITE_URL}/proyectos`, [{ pregunta: '¿Qué?', respuesta: 'Esto.' }]);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, 'Esto.');
  const types = pageJsonLd('/proyectos', [faq])['@graph'].map((n) => n['@type']);
  assert.deepEqual(types, ['Organization', 'WebSite', 'FAQPage', 'WebPage']);
});
