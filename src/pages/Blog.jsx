import React from 'react';
import { Link } from 'react-router-dom';
import posts from '../content/posts';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import { formatDate } from '../content/format';
import SuscripcionForm from '../components/SuscripcionForm';
import PROXIMOS from '../content/proximos';

// Los próximos más cercanos a la vista; el resto, en «Ver el calendario completo».
const VISIBLES = 3;

function Proximo(p) {
  return (
    <li className="oc-card" key={p.fecha}>
      <p style={{ fontSize: '0.8rem', color: 'var(--oc-ink)', opacity: 0.7, marginBottom: 8 }}>
        Lunes {formatDate(p.fecha)}
        {p.autor && ` · ${p.autor}`}
      </p>
      <h3>{p.titulo}</h3>
      <p style={{ fontSize: '0.95rem', marginBottom: 0 }}>{p.sinopsis}</p>
    </li>
  );
}

export default function Blog() {
  return (
    <>
      <Seo {...PAGES['/blog']} />
      <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative' }}>
          <span className="oc-eyebrow">Blog y boletín</span>
          <h1 className="oc-h1">Artículos e informes, con fuentes</h1>
          <p className="oc-lede">
            Ideas sobre democracia, instituciones y tecnología cívica, y los avances de Nicaragua Decide,
            siempre con fuentes verificables. Un artículo nuevo cada lunes.
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
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    aria-hidden="true"
                    className="oc-illustration"
                    style={{ width: '100%', marginBottom: 16 }}
                  />
                )}
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

      <section className="oc-section" aria-labelledby="proximos-titulo">
        <div className="oc-container" style={{ maxWidth: 820 }}>
          <span className="oc-eyebrow">Próximamente</span>
          <h2 className="oc-h2" id="proximos-titulo">
            Un artículo nuevo cada lunes
          </h2>
          <p className="oc-lede">
            Historias reales de personas y comunidades que se cansaron de esperar y empezaron a cambiar las
            reglas. Esto es lo que viene:
          </p>
          <ol className="oc-proximos">{PROXIMOS.slice(0, VISIBLES).map(Proximo)}</ol>
          {PROXIMOS.length > VISIBLES && (
            <details className="oc-proximos-mas">
              <summary>Ver el calendario completo ({PROXIMOS.length - VISIBLES} más)</summary>
              <ol className="oc-proximos" start={VISIBLES + 1}>
                {PROXIMOS.slice(VISIBLES).map(Proximo)}
              </ol>
            </details>
          )}
          <a href="#suscripcion" className="oc-btn oc-btn--primary">
            Suscríbete gratis y recíbelos en tu correo
          </a>
        </div>
      </section>

      <section className="oc-section oc-section--mist" id="suscripcion">
        <div className="oc-container" style={{ maxWidth: 560 }}>
          <SuscripcionForm />
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
