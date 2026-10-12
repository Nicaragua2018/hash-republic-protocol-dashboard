import React from 'react';
import { Link } from 'react-router-dom';
import posts from '../content/posts';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import { formatDate } from '../content/format';
import SuscripcionForm from '../components/SuscripcionForm';

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

      <section className="oc-section oc-section--mist">
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
