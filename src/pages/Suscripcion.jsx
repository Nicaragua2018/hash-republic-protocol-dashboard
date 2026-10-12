import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

// Única respuesta del formulario, para cualquier correo: no revela si la
// dirección ya estaba suscrita (spec del boletín, punto 5).
export default function Suscripcion() {
  return (
    <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
      <Seo {...PAGES['/blog/suscripcion']} />
      <div className="oc-hero-bees" aria-hidden="true" />
      <div className="oc-container oc-prose" style={{ position: 'relative' }}>
        <span className="oc-eyebrow">Boletín</span>
        <h1 className="oc-h1">Revisa tu correo</h1>
        <p className="oc-lede">
          Si el correo es válido y no estaba suscrito, en unos minutos recibirás un mensaje para confirmar.
          Revisa también la carpeta de spam.
        </p>
        <p>Solo quedarás suscrito si confirmas desde ese mensaje.</p>
        <Link to="/blog" className="oc-btn oc-btn--outline">
          Volver al blog
        </Link>
      </div>
    </section>
  );
}
