import React from 'react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer style={{ background: 'var(--oc-blue)', color: 'var(--oc-white)', marginTop: 64 }}>
      <img src="/divisor.svg" alt="" aria-hidden="true" style={{ width: '100%', display: 'block' }} />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 32,
        }}
        className="oc-footer-grid"
      >
        <div>
          <img
            src="/opencivic-icono-invertido.svg"
            alt=""
            aria-hidden="true"
            style={{ width: 48, height: 48, marginBottom: 12 }}
          />
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 360, fontSize: '0.9rem' }}>
            Las instituciones también son tecnologías. Construimos herramientas abiertas y verificables para
            cooperar, deliberar y decidir juntos.
          </p>
        </div>

        <div>
          <h3
            style={{
              color: 'var(--oc-yellow)',
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Navegación
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
            <Link to="/sobre" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              Qué es OpenCivic Solutions
            </Link>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              Blog y boletín
            </Link>
            <Link to="/proyectos" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              Proyectos
            </Link>
            <Link to="/unirse" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              Cómo contribuir
            </Link>
            <Link to="/contacto" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
              Información y contacto
            </Link>
          </nav>
        </div>

        <div>
          <h3
            style={{
              color: 'var(--oc-yellow)',
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Confianza
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            Repositorio:{' '}
            <a
              href="https://github.com/Nicaragua2018/hash-republic-protocol-dashboard"
              style={{ color: 'var(--oc-yellow)' }}
            >
              GitHub
            </a>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            Seguridad:{' '}
            <a href="mailto:info@opencivicsolutions.org" style={{ color: 'var(--oc-yellow)' }}>
              info@opencivicsolutions.org
            </a>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginTop: 12 }}>
            Código AGPL-3.0 · Contenido CC BY-SA 4.0 · Datos ODbL
          </p>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        © {CURRENT_YEAR} OpenCivic Solutions · Las instituciones también son tecnologías.
      </div>

      <style>{`
        @media (min-width: 720px) {
          .oc-footer-grid { grid-template-columns: 2fr 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
