import React, { useState } from 'react';

export default function Blog() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Suscripción al boletín de OpenCivic Solutions');
    const body = encodeURIComponent(`Quiero suscribirme al boletín con este correo: ${email}`);
    window.location.href = `mailto:info@opencivicsolutions.org?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative' }}>
          <span className="oc-eyebrow">Blog y boletín</span>
          <h1 className="oc-h1">Todavía en construcción abierta</h1>
          <p className="oc-lede">
            Esta sección reunirá artículos, informes del CEO y avances de cada proyecto —
            siempre con fuentes verificables. El lanzamiento del sitio completo está previsto
            para el 15 de enero de 2027. Mientras tanto, puedes suscribirte para recibir avisos
            cuando publiquemos algo.
          </p>
          <img
            src="/ilustracion-taller.jpg"
            alt="Una facilitadora explica un diagrama de hexágonos conectados a personas que toman notas"
            className="oc-illustration"
            style={{ marginTop: 32, maxWidth: 680 }}
          />
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container" style={{ maxWidth: 560 }}>
          <div className="oc-card">
            <h2 style={{ fontSize: '1.3rem' }}>Suscríbete al boletín</h2>
            {sent ? (
              <p>
                Se abrió tu cliente de correo con el mensaje listo. Si no se abrió, escríbenos
                directamente a{' '}
                <a href="mailto:info@opencivicsolutions.org">info@opencivicsolutions.org</a>.
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  aria-label="Correo electrónico"
                  style={{
                    flex: '1 1 220px',
                    padding: '12px 16px',
                    borderRadius: 999,
                    border: '1px solid rgba(10,56,128,0.25)',
                    fontSize: '0.95rem',
                  }}
                />
                <button type="submit" className="oc-btn oc-btn--primary">
                  Suscribirme
                </button>
              </form>
            )}
            <p style={{ fontSize: '0.8rem', marginTop: 12, marginBottom: 0 }}>
              Por ahora esto abre un correo precompletado hacia nuestro equipo — todavía no
              tenemos un proveedor de boletín conectado. No compartimos tu correo con nadie.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
