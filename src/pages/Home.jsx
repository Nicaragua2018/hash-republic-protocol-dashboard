import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import { getPostBySlug } from '../content/posts';
import { formatDate } from '../content/format';

const FORMULA = [
  {
    title: 'Democracia',
    job: 'para la soberanía',
    limit: 'El resultado sin ponderar siempre queda a la vista.',
  },
  {
    title: 'Competencia verificable',
    job: 'para el juicio técnico',
    limit: 'El peso adicional es de 1,3× como máximo, y solo se gana con capacidad técnica verificable.',
  },
  {
    title: 'Criptografía',
    job: 'para la prueba',
    limit: 'Informes con huella digital y sello de tiempo que cualquiera puede comprobar.',
  },
  {
    title: 'Constitución',
    job: 'para los límites',
    limit: 'Principios escritos que ninguna mayoría puede cruzar.',
  },
];

// Las tres entradas que Carlos eligió para Inicio, en este orden.
const DESTACADAS = [
  'por-que-existe-opencivic',
  'la-evolucion-del-lenguaje-como-tecnologia',
  'las-instituciones-tambien-son-tecnologia',
]
  .map(getPostBySlug)
  .filter(Boolean);

export default function Home() {
  return (
    <>
      <Seo {...PAGES['/']} />
      {/* Hero */}
      <section className="oc-hero oc-section" style={{ paddingTop: 72 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
          <div>
            <span className="oc-eyebrow">OS · Operating System cívico</span>
            <h1 className="oc-h1">Las instituciones también son tecnología</h1>
            <p className="oc-lede">
              OpenCivic Solutions construye tecnología cívica abierta y verificable: herramientas para
              cooperar, deliberar y decidir juntos, por la paz social y el bien común, sin pasar nunca por
              encima de la esperanza, la justicia o la dignidad de nadie.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 24 }}>
              <Link to="/blog" className="oc-btn oc-btn--primary">
                Leer el blog
              </Link>
              <Link to="/unirse" className="oc-btn oc-btn--outline">
                Únete
              </Link>
            </div>
          </div>
          <img
            src="/banner-claro.svg"
            alt="Logo de OpenCivic Solutions: un hexágono amarillo y una curva azul formando el monograma OS, con dos abejas trazando su vuelo alrededor"
            style={{ width: '100%', marginTop: 24 }}
          />
        </div>
      </section>

      <img src="/divisor.svg" alt="" aria-hidden="true" style={{ width: '100%', display: 'block' }} />

      {/* La fórmula */}
      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <span className="oc-eyebrow">La fórmula</span>
          <h2 className="oc-h2">Cuatro piezas, cada una con su límite</h2>
          <p className="oc-lede" style={{ marginBottom: 32 }}>
            Información verificable para todos: la IA ayuda a resumir y trazar fuentes; la criptografía prueba
            su integridad. El juicio final siempre es humano.
          </p>
          <div className="oc-grid oc-grid--4">
            {FORMULA.map((f) => (
              <div className="oc-card" key={f.title}>
                <h3>{f.title}</h3>
                <p style={{ fontWeight: 600, color: 'var(--oc-ink)', fontSize: '0.9rem' }}>{f.job}</p>
                <p style={{ fontSize: '0.9rem' }}>{f.limit}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/sobre" className="oc-btn oc-btn--outline">
              Leer la razón de ser completa
            </Link>
          </div>
        </div>
      </section>

      {/* Nuestro proyecto */}
      <section className="oc-section">
        <div className="oc-container" style={{ maxWidth: 760 }}>
          <span className="oc-eyebrow">Nuestro proyecto</span>
          <Link
            to="/proyectos"
            className="oc-card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginTop: 16 }}
          >
            <span className="oc-phase oc-phase--spec">En desarrollo</span>
            <h2 className="oc-h2" style={{ marginTop: 0 }}>
              Nicaragua Decide
            </h2>
            <p>
              Laboratorio de consultas cívicas para el exilio y la diáspora nicaragüense, con protección de
              identidad.
            </p>
            <span style={{ color: 'var(--oc-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
              Conocer el proyecto &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Del blog */}
      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <span className="oc-eyebrow">Del blog</span>
          <h2 className="oc-h2">Ideas, razones y recursos</h2>
          <p className="oc-lede" style={{ marginBottom: 32 }}>
            Por qué existe OpenCivic, en qué se apoya y qué puedes hacer con ello.
          </p>
          <div className="oc-grid oc-grid--3">
            {DESTACADAS.map((post) => (
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
          <div style={{ marginTop: 24 }}>
            <Link to="/blog" className="oc-btn oc-btn--outline">
              Ver todas las entradas
            </Link>
          </div>
        </div>
      </section>

      <img src="/divisor.svg" alt="" aria-hidden="true" style={{ width: '100%', display: 'block' }} />

      {/* CTA band */}
      <section className="oc-section oc-section--blue" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/opencivic-icono-invertido.svg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', width: 260, opacity: 0.12, top: -40, right: -40 }}
        />
        <div className="oc-container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 className="oc-h2">Hay lugar para quien programa, investiga, diseña, traduce o enseña</h2>
          <p style={{ maxWidth: 560, margin: '0 auto 24px' }}>
            Puedes participar con seudónimo. Todo pull request lleva fuentes: si una afirmación no se puede
            verificar, no se publica.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/unirse" className="oc-btn oc-btn--yellow">
              Cómo contribuir
            </Link>
            <Link
              to="/blog"
              className="oc-btn oc-btn--outline"
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              Suscribirme al boletín
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
