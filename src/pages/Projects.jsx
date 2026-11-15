import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import VideoColmena from '../components/VideoColmena';
import { CREDITOS, CAMBIOS_FOTOS } from '../content/videoColmena';
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
    <>
      <Seo {...PAGES['/proyectos']} />
      <section className="oc-hero oc-hero--centrado">
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container oc-hero-contenido">
          <span className="oc-eyebrow">Nuestro proyecto</span>
          <h1 className="oc-h1 oc-h1--portada">Nicaragua Decide</h1>
          <span className="oc-phase oc-phase--spec">En línea · por invitación</span>
          <p className="oc-lede">
            La plataforma donde el exilio y la diáspora nicaragüense se organizan y deciden juntos, con su
            identidad protegida.
          </p>
          <div className="oc-hero-botones">
            <a href={SITIO_URL} target="_blank" rel="noreferrer" className="oc-btn oc-btn--primary">
              Visitar nicaraguadecide.org &rarr;
            </a>
            <a href="#preguntas" className="oc-btn oc-btn--outline">
              Preguntas frecuentes
            </a>
          </div>
          <VideoColmena />
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container oc-texto-centrado">
          <h2 className="oc-h2">Qué es</h2>
          <p>{RESUMEN}</p>
          <p>
            Es el proyecto principal de OpenCivic. Como todo lo que hacemos, no gobierna desde arriba: las
            decisiones las toma la comunidad, de forma verificable.
          </p>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <div className="oc-titulo-centrado">
            <h2 className="oc-h2">Qué se puede hacer</h2>
            <p>Toca cada punto para ver el detalle</p>
          </div>
          <div className="oc-plegables oc-plegables--2">
            {FUNCIONES.map((f, i) => (
              <details className="oc-plegable" key={f.titulo}>
                <summary>
                  <span className="oc-plegable-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{f.titulo}</h3>
                </summary>
                <p>{f.texto}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container oc-dos-columnas">
          <div>
            <h2 className="oc-h2">En qué punto estamos</h2>
            <p>{ESTADO}</p>
            <p style={{ marginTop: 24 }}>
              <Link to="/blog" className="oc-btn oc-btn--primary">
                Sigue el avance en el blog
              </Link>
            </p>
          </div>
          <div className="oc-card">
            <h3>Lo que sigue</h3>
            <ol className="oc-lista-pasos">
              {SIGUIENTES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="oc-section oc-section--mist" id="preguntas">
        <div className="oc-container">
          <div className="oc-titulo-centrado">
            <h2 className="oc-h2">Para saber más</h2>
            <p>Tu seguridad y las preguntas más frecuentes</p>
          </div>
          <div className="oc-dos-columnas">
            <div>
              <h3 className="oc-grupo-titulo">Tu seguridad</h3>
              <div className="oc-plegables">
                <details className="oc-plegable">
                  <summary>
                    <h4>Cómo protege tu identidad</h4>
                  </summary>
                  <ul>
                    {PROTECCION.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </details>
                <details className="oc-plegable">
                  <summary>
                    <h4>Cómo se comprueban los resultados</h4>
                  </summary>
                  <ul>
                    {VERIFICACION.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
            <div>
              <h3 className="oc-grupo-titulo">Preguntas frecuentes</h3>
              <div className="oc-plegables">
                {FAQ.map((q) => (
                  <details className="oc-plegable" key={q.pregunta}>
                    <summary>
                      <h4>{q.pregunta}</h4>
                    </summary>
                    <p>{q.respuesta}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container oc-texto-centrado">
          <h2 className="oc-h2">¿Te quedó una duda?</h2>
          <div className="oc-hero-botones" style={{ marginBottom: 32 }}>
            <Link to="/contacto" className="oc-btn oc-btn--primary">
              Escríbenos
            </Link>
            <a href={SITIO_URL} target="_blank" rel="noreferrer" className="oc-btn oc-btn--outline">
              Visitar nicaraguadecide.org
            </a>
          </div>
          <details className="oc-creditos" style={{ marginBottom: 12 }}>
            <summary>
              <strong>Créditos de fotos y música del video</strong>
            </summary>
            <ul>
              {CREDITOS.map((c) => (
                <li key={c.obra}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.obra}
                  </a>
                  , {c.autor} ({c.licencia})
                </li>
              ))}
            </ul>
            <p>{CAMBIOS_FOTOS}</p>
          </details>
          <p style={{ fontSize: '0.9rem' }}>
            El código de Nicaragua Decide es abierto y está en{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            . La documentación técnica de trabajos anteriores, como Hash Republic Protocol, sigue disponible
            en{' '}
            <a href={REPOSITORIO} target="_blank" rel="noreferrer">
              GitHub
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
