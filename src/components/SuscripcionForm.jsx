import React, { useEffect } from 'react';

const WIDGET_SRC = '/boletin/altcha.js';

// Textos del widget en español (por defecto vienen en inglés).
const ALTCHA_ES = JSON.stringify({
  label: 'No soy un robot',
  verifying: 'Comprobando…',
  verified: 'Comprobado',
  error: 'No se pudo comprobar. Inténtalo de nuevo.',
  expired: 'La comprobación caducó. Inténtalo de nuevo.',
  waitAlert: 'Comprobando… espera un momento.',
  footer: 'Protegido por <a href="https://altcha.org/" target="_blank" rel="noopener">ALTCHA</a>',
});

// Formulario HTML normal hacia el portero (/boletin/suscribir). El widget
// ALTCHA es el que sirve Listmonk, así siempre coincide con su verificador.
// Funciona sin JavaScript propio: el navegador envía el formulario.
export default function SuscripcionForm() {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = WIDGET_SRC;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="oc-card">
      <h2 style={{ fontSize: '1.3rem' }}>Suscríbete al boletín</h2>
      <p style={{ fontSize: '0.92rem' }}>Te escribimos cuando publicamos un artículo nuevo.</p>
      <form method="post" action="/boletin/suscribir" style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          style={{
            padding: '12px 16px',
            borderRadius: 999,
            border: '1px solid rgba(10,56,128,0.25)',
            fontSize: '0.95rem',
          }}
        />
        {/* Campo trampa: las personas no lo ven; si viene lleno, es un bot. */}
        <input
          type="text"
          name="nonce"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
        />
        <altcha-widget challengeurl="/boletin/altcha" name="altcha" strings={ALTCHA_ES} />
        <button type="submit" className="oc-btn oc-btn--primary" style={{ justifySelf: 'start' }}>
          Suscribirme
        </button>
      </form>
      <p style={{ fontSize: '0.8rem', marginTop: 12, marginBottom: 0 }}>
        Solo guardamos tu correo, en nuestro propio servidor, para enviarte el boletín. No rastreamos si abres
        los correos. Puedes darte de baja, descargar o borrar tus datos desde el enlace que va al pie de cada
        mensaje.
      </p>
    </div>
  );
}
