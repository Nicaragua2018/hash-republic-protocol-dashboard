import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CORREO, WHATSAPP_NUMERO, WHATSAPP_URL, WHATSAPP_VISIBLE } from './contacto.js';

test('el correo de contacto es el buzón del dominio', () => {
  assert.equal(CORREO, 'info@opencivicsolutions.org');
});

test('el WhatsApp es un número de EE. UU. válido (+1 y 10 cifras) y coincide con el visible', () => {
  assert.match(WHATSAPP_NUMERO, /^1\d{10}$/);
  assert.equal(WHATSAPP_VISIBLE.replace(/\D/g, ''), WHATSAPP_NUMERO);
  assert.ok(WHATSAPP_URL.startsWith(`https://wa.me/${WHATSAPP_NUMERO}?text=`));
});
