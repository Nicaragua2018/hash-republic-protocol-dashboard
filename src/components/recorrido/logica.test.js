import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elegirObjetivo, posicionTarjeta, pasosDisponibles, cimaDeseada } from './logica.js';

const el = (ancho, alto, top = 0, left = 0) => ({
  getBoundingClientRect: () => ({
    width: ancho,
    height: alto,
    top,
    left,
    bottom: top + alto,
    right: left + ancho,
  }),
});

test('elegirObjetivo toma el primer elemento visible', () => {
  const oculto = el(0, 0); // el menú de escritorio en el celular
  const visible = el(40, 40);
  assert.equal(elegirObjetivo([oculto, visible]), visible);
  assert.equal(elegirObjetivo([oculto]), null);
  assert.equal(elegirObjetivo([]), null);
});

test('pasosDisponibles omite los pasos sin elemento en la página', () => {
  const pasos = [{ id: 'a' }, { id: 'honey' }, { id: 'c' }];
  const buscar = (id) => (id === 'honey' ? [] : [el(10, 10)]);
  assert.deepEqual(
    pasosDisponibles(pasos, buscar).map((p) => p.id),
    ['a', 'c']
  );
});

test('la tarjeta va debajo del elemento si cabe, si no arriba, y nunca se sale de la pantalla', () => {
  const vista = { ancho: 390, alto: 844 };
  const tarjeta = { ancho: 320, alto: 200 };
  // Cabe debajo.
  assert.deepEqual(posicionTarjeta({ top: 100, bottom: 200, left: 24, width: 340 }, vista, tarjeta), {
    top: 216,
    left: 24,
  });
  // No cabe debajo: arriba.
  assert.deepEqual(posicionTarjeta({ top: 500, bottom: 760, left: 24, width: 340 }, vista, tarjeta), {
    top: 284,
    left: 24,
  });
  // Elemento a la derecha (la burbuja de HONEY): la tarjeta se ajusta al borde.
  const honey = posicionTarjeta({ top: 780, bottom: 832, left: 326, width: 52 }, vista, tarjeta);
  assert.equal(honey.left, 390 - 320 - 16);
  assert.equal(honey.top, 780 - 16 - 200);
  // Elemento enorme que no deja sitio ni arriba ni abajo: tarjeta abajo, dentro de la pantalla.
  const grande = posicionTarjeta({ top: 0, bottom: 844, left: 0, width: 390 }, vista, tarjeta);
  assert.equal(grande.top, 844 - 200 - 16);
});

test('cimaDeseada deja sitio a la tarjeta debajo del elemento', () => {
  const vista = { ancho: 390, alto: 844 };
  const tarjeta = { ancho: 340, alto: 195 };
  // Elemento bajo: el conjunto (elemento + tarjeta) queda centrado bajo la cabecera.
  const bajo = cimaDeseada(100, vista, tarjeta, 66);
  assert.ok(bajo >= 66);
  assert.ok(bajo + 100 + 16 + 195 <= 844 - 16);
  // Los tres pasos en el celular (~560 px): la tarjeta cabe debajo sin taparlos.
  const alto = cimaDeseada(560, vista, tarjeta, 66);
  assert.equal(alto + 560 + 16 + 195, 844 - 16);
});
