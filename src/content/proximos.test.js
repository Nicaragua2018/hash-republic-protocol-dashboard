import { test } from 'node:test';
import assert from 'node:assert/strict';
import PROXIMOS, { proximoPorSlug } from './proximos.js';

test('cada entrada tiene fecha, título y sinopsis', () => {
  for (const p of PROXIMOS) {
    assert.match(p.fecha, /^\d{4}-\d{2}-\d{2}$/, p.titulo);
    assert.ok(p.titulo.trim(), 'falta el título');
    assert.ok(p.sinopsis.trim().length > 80, `sinopsis muy corta: ${p.titulo}`);
  }
});

test('uno por semana, todos los lunes, en orden', () => {
  const dias = PROXIMOS.map((p) => new Date(`${p.fecha}T12:00:00Z`));
  for (const d of dias) assert.equal(d.getUTCDay(), 1, `no es lunes: ${d.toISOString()}`);
  for (let i = 1; i < dias.length; i++) {
    assert.equal((dias[i] - dias[i - 1]) / 86_400_000, 7, `no hay una semana entre ${i - 1} y ${i}`);
  }
});

test('títulos y slugs sin repetir', () => {
  const titulos = PROXIMOS.map((p) => p.titulo);
  assert.equal(new Set(titulos).size, titulos.length);
  const slugs = PROXIMOS.filter((p) => p.slug).map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('proximoPorSlug encuentra los artículos que vuelven', () => {
  const p = proximoPorSlug('soberania-tecnologica-y-de-ia');
  assert.equal(p.titulo, 'Soberanía tecnológica');
  assert.equal(proximoPorSlug('no-existe'), undefined);
});
