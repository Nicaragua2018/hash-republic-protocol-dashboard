import React from 'react';
import { Link } from 'react-router-dom';
import posts from '../content/posts';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import { formatDate } from '../content/format';
import SuscripcionForm from '../components/SuscripcionForm';
import PROXIMOS from '../content/proximos';

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
            Esta sección reunirá artículos, informes del CEO y avances de cada proyecto — siempre con fuentes
            verificables. El lanzamiento del sitio completo está previsto para el 15 de enero de 2027;
            mientras tanto, publicamos aquí lo que ya está listo.
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
          <ol className="oc-proximos">
            {PROXIMOS.map((p) => (
              <li className="oc-card" key={p.fecha}>
                <p style={{ fontSize: '0.8rem', color: 'var(--oc-ink)', opacity: 0.7, marginBottom: 8 }}>
                  Lunes {formatDate(p.fecha)}
                  {p.autor && ` · ${p.autor}`}
                </p>
                <h3>{p.titulo}</h3>
                <p style={{ fontSize: '0.95rem', marginBottom: 0 }}>{p.sinopsis}</p>
              </li>
            ))}
          </ol>
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
