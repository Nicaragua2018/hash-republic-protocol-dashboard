import React from 'react';
import { Link } from 'react-router-dom';

const FORMULA = [
  { title: 'Democracia', job: 'para la soberanía', limit: 'El resultado sin ponderar siempre queda a la vista.' },
  { title: 'Competencia verificable', job: 'para el juicio técnico', limit: 'El peso adicional es de 1,3× como máximo, y solo se gana con capacidad técnica verificable.' },
  { title: 'Criptografía', job: 'para la prueba', limit: 'Informes con huella digital y sello de tiempo que cualquiera puede comprobar.' },
  { title: 'Constitución', job: 'para los límites', limit: 'Principios escritos que ninguna mayoría puede cruzar.' },
];

const FEATURED_PROJECTS = [
  {
    name: 'Hash Republic Protocol',
    blurb: 'Delegación líquida por dominio, reputación con tope y reportes canónicos verificables.',
    phase: 'Arquitectura v0.1',
    phaseClass: 'oc-phase--spec',
    to: '/proyectos/hash-republic-protocol',
  },
  {
    name: 'Observatorio de preparación cuántica de Bitcoin',
    blurb: 'Mapa público de riesgos y señales no vinculantes. No gobierna Bitcoin ni sustituye el proceso de BIP.',
    phase: 'Especificación · objetivo R2',
    phaseClass: 'oc-phase--spec',
    to: '/proyectos',
  },
  {
    name: 'Nicaragua Decide',
    blurb: 'Laboratorio de consultas cívicas para el exilio y la diáspora nicaragüense, con protección de identidad.',
    phase: 'Idea',
    phaseClass: 'oc-phase--idea',
    to: '/proyectos',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="oc-hero oc-section" style={{ paddingTop: 72 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ display: 'grid', gap: 40, alignItems: 'center' }}>
          <div>
            <span className="oc-eyebrow">OS · Operating System cívico</span>
            <h1 className="oc-h1">Las instituciones también son tecnología</h1>
            <p className="oc-lede">
              OpenCivic Solutions construye tecnología cívica abierta y verificable: herramientas
              para cooperar, deliberar y decidir juntos, por la paz social y el bien común, sin
              pasar nunca por encima de la esperanza, la justicia o la dignidad de nadie.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 24 }}>
              <Link to="/proyectos" className="oc-btn oc-btn--primary">Conoce los proyectos</Link>
              <Link to="/unirse" className="oc-btn oc-btn--outline">Únete</Link>
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
            Información verificable para todos: la IA ayuda a resumir y trazar fuentes; la
            criptografía prueba su integridad. El juicio final siempre es humano.
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
            <Link to="/sobre" className="oc-btn oc-btn--outline">Leer la razón de ser completa</Link>
          </div>
        </div>
      </section>

      {/* Proyectos destacados */}
      <section className="oc-section">
        <div className="oc-container">
          <span className="oc-eyebrow">Construimos en abierto</span>
          <h2 className="oc-h2">Proyectos</h2>
          <p className="oc-lede" style={{ marginBottom: 32 }}>
            Decimos en qué fase está cada cosa: idea, borrador, especificación o arquitectura.
          </p>
          <div className="oc-grid oc-grid--3">
            {FEATURED_PROJECTS.map((p) => (
              <Link to={p.to} className="oc-card" key={p.name} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <span className={`oc-phase ${p.phaseClass}`}>{p.phase}</span>
                <h3>{p.name}</h3>
                <p style={{ fontSize: '0.92rem' }}>{p.blurb}</p>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/proyectos" className="oc-btn oc-btn--outline">Ver todos los proyectos</Link>
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
            Puedes participar con seudónimo. Todo pull request lleva fuentes: si una afirmación
            no se puede verificar, no se publica.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/unirse" className="oc-btn oc-btn--yellow">Cómo contribuir</Link>
            <Link to="/blog" className="oc-btn oc-btn--outline" style={{ borderColor: '#fff', color: '#fff' }}>Suscribirme al boletín</Link>
          </div>
        </div>
      </section>
    </>
  );
}
