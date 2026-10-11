import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <section className="oc-section" style={{ paddingTop: 72, textAlign: 'center' }}>
      <Seo title="Página no encontrada — OpenCivic Solutions" description="Esta página no existe o se movió de lugar." />
      <div className="oc-container">
        <span className="oc-eyebrow">404</span>
        <h1 className="oc-h1">No encontramos esta página</h1>
        <p className="oc-lede" style={{ margin: '0 auto 24px' }}>
          El enlace puede estar roto o la página se movió. Prueba desde el inicio.
        </p>
        <Link to="/" className="oc-btn oc-btn--primary">Volver al inicio</Link>
      </div>
    </section>
  );
}
