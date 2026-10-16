import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

const REPOSITORIO = 'https://github.com/Nicaragua2018/hash-republic-protocol-dashboard';

export default function Projects() {
  return (
    <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
      <Seo {...PAGES['/proyectos']} />
      <div className="oc-hero-bees" aria-hidden="true" />
      <div className="oc-container" style={{ position: 'relative', maxWidth: 760 }}>
        <span className="oc-eyebrow">Nuestro proyecto</span>
        <h1 className="oc-h1">Nicaragua Decide</h1>
        <span className="oc-phase oc-phase--spec">En desarrollo</span>
        <p className="oc-lede">
          Laboratorio de consultas cívicas para el exilio y la diáspora nicaragüense, con protección de
          identidad.
        </p>
        <p>
          Es el único proyecto que OpenCivic tiene hoy en desarrollo. Como todo lo que hacemos, no gobierna
          por sí solo: produce evidencia y herramientas, y el juicio final siempre es de la comunidad.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0 40px' }}>
          <Link to="/blog" className="oc-btn oc-btn--primary">
            Sigue el avance en el blog
          </Link>
          <Link to="/contacto" className="oc-btn oc-btn--outline">
            Escríbenos
          </Link>
        </div>
        <p style={{ fontSize: '0.9rem' }}>
          La documentación técnica de trabajos anteriores, como Hash Republic Protocol, sigue disponible en{' '}
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}
