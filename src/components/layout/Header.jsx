import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/sobre', label: 'Qué es OpenCivic' },
  { to: '/blog', label: 'Blog' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/unirse', label: 'Unirse' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const linkStyle = ({ isActive }) => ({
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 500,
    textDecoration: 'none',
    color: isActive ? 'var(--oc-white)' : 'var(--oc-blue)',
    background: isActive ? 'var(--oc-blue)' : 'transparent',
    transition: 'background var(--oc-transition), color var(--oc-transition)',
    whiteSpace: 'nowrap',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(10,56,128,0.1)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <NavLink
          to="/"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          aria-label="OpenCivic Solutions — Inicio"
        >
          <img src="/opencivic-horizontal-color.svg" alt="OpenCivic Solutions" style={{ height: 36 }} />
        </NavLink>

        {/* Desktop nav */}
        <nav
          style={{ display: 'none', gap: 4, alignItems: 'center' }}
          className="oc-nav-desktop"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="oc-nav-toggle"
          style={{
            display: 'inline-flex',
            background: 'transparent',
            border: 'none',
            color: 'var(--oc-blue)',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          aria-label="Navegación móvil"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 16px 16px',
            gap: 4,
            borderTop: '1px solid rgba(10,56,128,0.08)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--oc-white)' : 'var(--oc-blue)',
                background: isActive ? 'var(--oc-blue)' : 'var(--oc-mist)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        @media (min-width: 860px) {
          .oc-nav-desktop { display: flex !important; }
          .oc-nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
