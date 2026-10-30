import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import { getPostBySlug } from '../content/posts';
import DESTACADOS from '../content/destacados';
import { formatDate } from '../content/format';
import Recorrido from '../components/recorrido/Recorrido.jsx';
import { EVENTO_RECORRIDO } from '../components/recorrido/logica.js';

// Qué hace posible Nicaragua Decide, en tres pasos (src/content/nicaraguaDecide.js).
const PASOS = [
  {
    titulo: 'Deliberar',
    texto: 'Propones y conversas en el grupo de tu territorio, con tu identidad protegida.',
  },
  {
    titulo: 'Decidir',
    texto:
      'Votas ordenando las opciones de la que más a la que menos prefieres, o se elige por sorteo, como un jurado.',
  },
  {
    titulo: 'Comprobar',
    texto: 'Cualquiera puede recalcular el resultado. No hace falta confiar a ciegas.',
  },
];

// Las cuatro piezas de la razón de ser (/sobre), dichas en sencillo.
const FORMULA = [
  {
    title: 'La gente decide',
    limit: 'Democracia: el resultado de cada votación se muestra siempre tal cual, sin ajustes.',
  },
  {
    title: 'El saber cuenta, con límite',
    limit:
      'Competencia verificable: quien demuestra conocimiento de un tema puede pesar un poco más, nunca más de 1,3 veces.',
  },
  {
    title: 'Pruebas que no se alteran',
    limit: 'Criptografía: cada informe lleva una huella digital y una fecha que cualquiera puede comprobar.',
  },
  {
    title: 'Líneas que nadie cruza',
    limit: 'Constitución: principios escritos que ninguna mayoría puede saltarse.',
  },
];

const [PARA_EMPEZAR, ...DESTACADAS] = DESTACADOS.map(getPostBySlug).filter(Boolean);

export default function Home() {
  return (
    <>
      <Seo {...PAGES['/']} />
      {/* Hero */}
      <section className="oc-hero oc-section" style={{ paddingTop: 72 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <svg className="oc-abeja" viewBox="0 0 40 32" width="40" height="32" aria-hidden="true">
          <ellipse className="oc-abeja-ala" cx="16" cy="9" rx="7" ry="5" />
          <ellipse className="oc-abeja-ala oc-abeja-ala--2" cx="24" cy="9" rx="7" ry="5" />
          <ellipse cx="20" cy="19" rx="11" ry="8" fill="#f2b00a" />
          <path d="M16 11.6v14.8M22 11v16" stroke="#0a3880" strokeWidth="3" />
          <circle cx="31" cy="17" r="4" fill="#0a3880" />
        </svg>
        <div className="oc-container" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
          <div>
            <span className="oc-eyebrow">Tecnología cívica abierta</span>
            <h1 className="oc-h1" data-recorrido="inicio">
              Las instituciones también son tecnología
            </h1>
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
            <button
              type="button"
              className="oc-enlace-recorrido"
              onClick={() => window.dispatchEvent(new Event(EVENTO_RECORRIDO))}
            >
              ¿Primera vez aquí? Haz el recorrido con HONEY (1 minuto)
            </button>
          </div>
          <ol className="oc-pasos" aria-label="Cómo funciona Nicaragua Decide" data-recorrido="pasos">
            {PASOS.map((paso, i) => (
              <li className="oc-paso" key={paso.titulo}>
                <span className="oc-paso-numero" aria-hidden="true">
                  {i + 1}
                </span>
                <h2 className="oc-paso-titulo">{paso.titulo}</h2>
                <p>{paso.texto}</p>
              </li>
            ))}
          </ol>
          <p style={{ margin: 0 }}>
            <Link to="/proyectos" style={{ color: 'var(--oc-blue)', fontWeight: 600 }}>
              Así funciona Nicaragua Decide, nuestro proyecto &rarr;
            </Link>
          </p>
        </div>
      </section>

      <img src="/divisor.svg" alt="" aria-hidden="true" style={{ width: '100%', display: 'block' }} />

      {/* La fórmula */}
      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <span className="oc-eyebrow">Cómo cuidamos las decisiones</span>
          <h2 className="oc-h2" data-recorrido="piezas">
            Cuatro piezas, cada una con su límite
          </h2>
          <p className="oc-lede" style={{ marginBottom: 32 }}>
            La tecnología ayuda a ordenar y comprobar la información, pero el juicio final siempre es humano.
          </p>
          <div className="oc-grid oc-grid--4">
            {FORMULA.map((f) => (
              <div className="oc-card" key={f.title}>
                <h3>{f.title}</h3>
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
          <h2 className="oc-h2" data-recorrido="blog">
            Ideas, razones y recursos
          </h2>
          <p className="oc-lede" style={{ marginBottom: 32 }}>
            Por qué existe OpenCivic, en qué se apoya y qué puedes hacer con ello.
          </p>
          {PARA_EMPEZAR && (
            <Link
              to={`/blog/${PARA_EMPEZAR.slug}`}
              className="oc-card oc-card--empezar"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 24 }}
            >
              {PARA_EMPEZAR.image && (
                <img
                  src={PARA_EMPEZAR.image}
                  alt=""
                  aria-hidden="true"
                  className="oc-illustration"
                  style={{ width: '100%', marginBottom: 16 }}
                />
              )}
              <span className="oc-etiqueta-empezar">Para empezar</span>
              <h3>{PARA_EMPEZAR.title}</h3>
              <p>{PARA_EMPEZAR.dek}</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                {PARA_EMPEZAR.author && `${PARA_EMPEZAR.author} · `}
                {formatDate(PARA_EMPEZAR.date)}
              </p>
              <span style={{ color: 'var(--oc-blue)', fontWeight: 600 }}>Leer el ensayo &rarr;</span>
            </Link>
          )}
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
          <div
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
            data-recorrido="boletin"
          >
            <Link to="/unirse" className="oc-btn oc-btn--yellow">
              Cómo contribuir
            </Link>
            <Link
              to="/blog#suscripcion"
              className="oc-btn oc-btn--outline"
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              Suscribirme al boletín
            </Link>
          </div>
        </div>
      </section>
      <Recorrido />
    </>
  );
}
