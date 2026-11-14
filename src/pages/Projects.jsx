import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import {
  RESUMEN,
  FUNCIONES,
  PROTECCION,
  VERIFICACION,
  ESTADO,
  SIGUIENTES,
  FAQ,
  REPO_URL,
  SITIO_URL,
} from '../content/nicaraguaDecide';

const REPOSITORIO = 'https://github.com/Nicaragua2018/hash-republic-protocol-dashboard';

export default function Projects() {
  return (
    <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
      <Seo {...PAGES['/proyectos']} />
      <div className="oc-hero-bees" aria-hidden="true" />
      <div className="oc-container" style={{ position: 'relative', maxWidth: 760 }}>
        <span className="oc-eyebrow">Nuestro proyecto</span>
        <h1 className="oc-h1">Nicaragua Decide</h1>
        <span className="oc-phase oc-phase--spec">En línea · por invitación</span>
        <p className="oc-lede">
          La plataforma donde el exilio y la diáspora nicaragüense se organizan y deciden juntos, con su
          identidad protegida.
        </p>
        <p>{RESUMEN}</p>
        <p>
          Es el proyecto principal de OpenCivic. Como todo lo que hacemos, no gobierna desde arriba: las
          decisiones las toma la comunidad, de forma verificable.
        </p>
        <p style={{ margin: '24px 0 32px' }}>
          <a href={SITIO_URL} target="_blank" rel="noreferrer" className="oc-btn oc-btn--primary">
            Visitar nicaraguadecide.org &rarr;
          </a>
        </p>

        <h2 className="oc-h2">Qué se puede hacer</h2>
        <div className="oc-grid oc-grid--2" style={{ marginBottom: 32 }}>
          {FUNCIONES.map((f) => (
            <div className="oc-card" key={f.titulo}>
              <h3>{f.titulo}</h3>
              <p>{f.texto}</p>
            </div>
          ))}
        </div>

        <h2 className="oc-h2">En qué punto estamos</h2>
        <p>{ESTADO}</p>

        <h2 className="oc-h2" id="preguntas">
          Para saber más
        </h2>
        <details style={{ marginBottom: 12 }}>
          <summary>
            <strong>Cómo protege tu identidad</strong>
          </summary>
          <ul>
            {PROTECCION.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
        <details style={{ marginBottom: 12 }}>
          <summary>
            <strong>Cómo se comprueban los resultados</strong>
          </summary>
          <ul>
            {VERIFICACION.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
        <details style={{ marginBottom: 12 }}>
          <summary>
            <strong>Lo que sigue</strong>
          </summary>
          <ol>
            {SIGUIENTES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </details>
        {FAQ.map((q) => (
          <details key={q.pregunta} style={{ marginBottom: 12 }}>
            <summary>
              <strong>{q.pregunta}</strong>
            </summary>
            <p>{q.respuesta}</p>
          </details>
        ))}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0 40px' }}>
          <Link to="/blog" className="oc-btn oc-btn--primary">
            Sigue el avance en el blog
          </Link>
          <Link to="/contacto" className="oc-btn oc-btn--outline">
            Escríbenos
          </Link>
        </div>
        <p style={{ fontSize: '0.9rem' }}>
          El código de Nicaragua Decide es abierto y está en{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          . La documentación técnica de trabajos anteriores, como Hash Republic Protocol, sigue disponible en{' '}
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}
