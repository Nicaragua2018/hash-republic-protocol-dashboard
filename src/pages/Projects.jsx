import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

const PROJECTS = [
  {
    name: 'Hash Republic Protocol',
    blurb:
      'Protocolo abierto de delegación líquida por dominio, reputación con tope, detección de captura e informes canónicos.',
    phase: 'Arquitectura v0.1',
    phaseClass: 'oc-phase--spec',
    to: '/proyectos/hash-republic-protocol',
    cta: 'Abrir el dashboard',
  },
  {
    name: 'BitCuant',
    blurb:
      'Una comunidad conversa y un agente propone consultas breves y trazables. El agente no vota ni decide.',
    phase: 'Especificación lista',
    phaseClass: 'oc-phase--spec',
  },
  {
    name: 'Nicaragua Decide',
    blurb:
      'Laboratorio de consultas cívicas para el exilio y la diáspora nicaragüense, con protección de identidad.',
    phase: 'Idea',
    phaseClass: 'oc-phase--idea',
  },
  {
    name: 'Guía de seguridad digital',
    blurb: 'Hábitos prácticos para comunidades en riesgo, con fuentes verificadas.',
    phase: 'Borrador v0.1',
    phaseClass: 'oc-phase--draft',
  },
];

export default function Projects() {
  return (
    <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
      <Seo {...PAGES['/proyectos']} />
      <div className="oc-hero-bees" aria-hidden="true" />
      <div className="oc-container" style={{ position: 'relative' }}>
        <span className="oc-eyebrow">Proyectos</span>
        <h1 className="oc-h1">Construimos en abierto</h1>
        <p className="oc-lede" style={{ marginBottom: 40 }}>
          Decimos en qué fase está cada cosa: idea, borrador, especificación o arquitectura. Ningún proyecto
          gobierna por sí solo — cada uno produce evidencia o herramientas, y el juicio final siempre es de la
          comunidad.
        </p>

        <div className="oc-grid oc-grid--3">
          {PROJECTS.map((p) => {
            const Card = (
              <>
                <span className={`oc-phase ${p.phaseClass}`}>{p.phase}</span>
                <h3>{p.name}</h3>
                <p style={{ fontSize: '0.92rem' }}>{p.blurb}</p>
                {p.cta && (
                  <span style={{ color: 'var(--oc-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {p.cta} &rarr;
                  </span>
                )}
              </>
            );
            return p.to ? (
              <Link
                to={p.to}
                className="oc-card"
                key={p.name}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {Card}
              </Link>
            ) : (
              <div className="oc-card" key={p.name}>
                {Card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
