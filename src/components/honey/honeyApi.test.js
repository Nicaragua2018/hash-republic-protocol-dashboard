import { test } from 'node:test';
import assert from 'node:assert/strict';
import { honeyActivo, preguntar, votar, recortarHistorial, NO_DISPONIBLE } from './honeyApi.js';

const responde = (status, cuerpo) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => cuerpo,
});
const html = async () => ({
  ok: true,
  status: 200,
  json: async () => {
    throw new SyntaxError('no es JSON');
  },
});
const falla = async () => {
  throw new Error('sin red');
};

test('honeyActivo solo con 200 y {activo: true}', async () => {
  assert.equal(await honeyActivo(responde(200, { activo: true })), true);
  assert.equal(await honeyActivo(html), false); // la página del sitio respondiendo por /honey/salud
  assert.equal(await honeyActivo(responde(200, { activo: 'sí' })), false);
  assert.equal(await honeyActivo(responde(503, { activo: false })), false);
  assert.equal(await honeyActivo(responde(404, null)), false);
  assert.equal(await honeyActivo(falla), false);
});

test('recortarHistorial deja pares completos, los 6 últimos, y corta textos largos', () => {
  const turnos = Array.from({ length: 10 }, (_, i) => ({
    rol: i % 2 === 0 ? 'usuario' : 'asistente',
    texto: `t${i}`,
  }));
  assert.deepEqual(
    recortarHistorial(turnos).map((t) => t.texto),
    ['t4', 't5', 't6', 't7', 't8', 't9']
  );
  assert.deepEqual(
    recortarHistorial(turnos.slice(0, 3)).map((t) => t.texto),
    ['t0', 't1']
  );
  const largo = recortarHistorial([
    { rol: 'usuario', texto: 'x'.repeat(1500) },
    { rol: 'asistente', texto: 'ok', estado: 'ok', fuentes: [] },
  ]);
  assert.equal(largo[0].texto.length, 1000);
  assert.deepEqual(Object.keys(largo[1]), ['rol', 'texto']);
});

test('preguntar envía la pregunta y el historial recortado', async () => {
  let llamada;
  const fetchFn = async (url, opciones) => {
    llamada = { url, opciones };
    return responde(200, { id: 'r_1', texto: 'Hola.', estado: 'ok', fuentes: [] })();
  };
  const r = await preguntar('¿Qué es?', [{ rol: 'usuario', texto: 'x' }], fetchFn);
  assert.equal(llamada.url, '/honey/chat');
  assert.equal(llamada.opciones.method, 'POST');
  assert.deepEqual(JSON.parse(llamada.opciones.body), { pregunta: '¿Qué es?', historial: [] });
  assert.deepEqual(r, { id: 'r_1', texto: 'Hola.', estado: 'ok', fuentes: [] });
});

test('preguntar solo deja fuentes internas del sitio', async () => {
  const fuentes = [
    { titulo: 'Sobre', url: '/sobre' },
    { titulo: 'Fuera', url: 'https://malo.example' },
    { titulo: 'Doble', url: '//malo.example' },
    { titulo: 3, url: '/x' },
  ];
  const r = await preguntar('x', [], responde(200, { id: 'r_1', texto: 'T', estado: 'ok', fuentes }));
  assert.deepEqual(r.fuentes, [{ titulo: 'Sobre', url: '/sobre' }]);
});

test('preguntar convierte cualquier fallo en no_disponible', async () => {
  const rapido = await preguntar('x', [], responde(429, null));
  assert.equal(rapido.estado, 'no_disponible');
  assert.match(rapido.texto, /muy rápido/);
  assert.deepEqual(await preguntar('x', [], responde(500, null)), NO_DISPONIBLE);
  assert.deepEqual(await preguntar('x', [], falla), NO_DISPONIBLE);
  assert.deepEqual(await preguntar('x', [], html), NO_DISPONIBLE);
  assert.deepEqual(await preguntar('x', [], responde(200, { estado: 'ok' })), NO_DISPONIBLE);
});

test('votar', async () => {
  let cuerpo;
  const ok = await votar('r_1', true, async (url, o) => {
    cuerpo = JSON.parse(o.body);
    return responde(204, null)();
  });
  assert.equal(ok, true);
  assert.deepEqual(cuerpo, { id: 'r_1', util: true });
  assert.equal(await votar('r_1', false, falla), false);
});

test('recortarHistorial descarta los intercambios que fallaron', () => {
  const h = [
    { rol: 'usuario', texto: 'u0' },
    { rol: 'asistente', texto: 'a0', estado: 'ok' },
    { rol: 'usuario', texto: 'u1' },
    { rol: 'asistente', texto: 'Ahora mismo no puedo responder.', estado: 'no_disponible' },
    { rol: 'usuario', texto: 'u2' },
    { rol: 'asistente', texto: 'a2', estado: 'ok' },
  ];
  assert.deepEqual(
    recortarHistorial(h).map((t) => t.texto),
    ['u0', 'a0', 'u2', 'a2']
  );
});

test('preguntar recorta el historial más viejo hasta que el cuerpo quepa en 8 KB', async () => {
  let cuerpo;
  const fetchFn = async (url, o) => {
    cuerpo = o.body;
    return responde(200, { id: 'r_1', texto: 'T', estado: 'ok', fuentes: [] })();
  };
  const historial = Array.from({ length: 6 }, (_, i) => ({
    rol: i % 2 === 0 ? 'usuario' : 'asistente',
    texto: `${i}` + 'ñ😀'.repeat(330),
  }));
  await preguntar('¿Y ahora?', historial, fetchFn);
  const enviado = JSON.parse(cuerpo);
  assert.ok(new TextEncoder().encode(cuerpo).length <= 8000);
  assert.ok(enviado.historial.length > 0 && enviado.historial.length % 2 === 0);
  assert.equal(enviado.historial.at(-1).texto, historial.at(-1).texto);
});
