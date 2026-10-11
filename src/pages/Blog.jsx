import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import posts from '../content/posts';

const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });

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
          <h1 className="oc-h1">Artículos e informes, con fuentes</h1>
          <p className="oc-lede">
            Esta sección reunirá artículos, informes del CEO y avances de cada proyecto — siempre
            con fuentes verificables. El lanzamiento del sitio completo está previsto para el 15
            de enero de 2027; mientras tanto, publicamos aquí lo que ya está listo.
          </p>
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container">
          <div className="oc-grid oc-grid--2">
            {posts.map((post) => (
              <Link
                to={`/blog/${post.slug}`}
                className="oc-card"
                key={post.slug}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <p style={{ fontSize: '0.8rem', color: 'var(--oc-ink)', opacity: 0.7, marginBottom: 8 }}>
                  {formatDate(post.date)}
                </p>
                <h3>{post.title}</h3>
                <p style={{ fontSize: '0.92rem' }}>{post.dek}</p>
                <span style={{ color: 'var(--oc-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Leer el artículo &rarr;
                </span>
              </Link>
            ))}
          </div>
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
          <img
            src="/ilustracion-taller.jpg"
            alt="Una facilitadora explica un diagrama de hexágonos conectados a personas que toman notas"
            className="oc-illustration"
            style={{ marginTop: 32 }}
          />
        </div>
      </section>
    </>
  );
}
