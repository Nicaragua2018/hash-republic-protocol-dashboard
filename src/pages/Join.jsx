import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

const WAYS = [
  {
    title: 'Programar',
    detail: 'Código abierto en cada repositorio de proyecto, con tareas marcadas para principiantes.',
  },
  {
    title: 'Investigar',
    detail: 'Verificar fuentes, modelar riesgos, documentar casos de estudio como vTaiwan o Nepal 2025.',
  },
  {
    title: 'Diseñar',
    detail: 'Ilustración, UI y sistemas de diseño que sigan el manual de marca de OpenCivic.',
  },
  {
    title: 'Traducir',
    detail: 'Al inglés, francés o portugués — el mismo contenido, el mismo tono, no traducciones literales.',
  },
  { title: 'Enseñar', detail: 'Explicar estos protocolos a comunidades que todavía no los conocen.' },
];

const PASOS = [
  {
    titulo: 'Lee las bases',
    texto:
      'Lee las bases de SOUL.md: ahí están los límites que no se negocian en cualquier proyecto de OpenCivic.',
  },
  {
    titulo: 'Elige una tarea',
    texto: 'Busca una tarea marcada para principiantes en el repositorio del proyecto que te interese.',
  },
  {
    titulo: 'Envía tu aporte',
    texto: 'Abre un pull request con tus fuentes: si una afirmación no se puede verificar, no se publica.',
  },
];

export default function Join() {
  return (
    <>
      <Seo {...PAGES['/unirse']} />
      <section className="oc-section oc-hero oc-section--mist" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div
          className="oc-container oc-dos-columnas oc-dos-columnas--centro"
          style={{ position: 'relative' }}
        >
          <div>
            <span className="oc-eyebrow">Unirse</span>
            <h1 className="oc-h1">Cómo contribuir</h1>
            <p className="oc-lede">
              Hay lugar para quien programa, investiga, diseña, traduce o enseña. Puedes participar con
              seudónimo. No compartas en issues ni en pull requests información que pueda identificarte a ti o
              a otras personas en riesgo.
            </p>
            <div className="oc-hero-botones" style={{ justifyContent: 'flex-start' }}>
              <a
                href="https://github.com/Nicaragua2018/hash-republic-protocol-dashboard"
                className="oc-btn oc-btn--primary"
                target="_blank"
                rel="noreferrer"
              >
                Ver el repositorio en GitHub
              </a>
              <Link to="/contacto" className="oc-btn oc-btn--outline">
                Escríbenos
              </Link>
            </div>
          </div>
          <img
            src="/ilustracion-asamblea.jpg"
            alt="Una comunidad diversa reunida alrededor de una mesa, deliberando frente a un tablero con notas"
            className="oc-illustration"
          />
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container">
          <div className="oc-titulo-centrado">
            <h2 className="oc-h2">Cinco formas de aportar</h2>
            <p>Elige la que se parezca más a lo que sabes hacer</p>
          </div>
          <div className="oc-grid oc-formas">
            {WAYS.map((w) => (
              <div className="oc-card" key={w.title}>
                <h3>{w.title}</h3>
                <p style={{ fontSize: '0.92rem' }}>{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <div className="oc-titulo-centrado">
            <h2 className="oc-h2">Tres pasos</h2>
            <p>Para hacer tu primer aporte</p>
          </div>
          <ol className="oc-pasos">
            {PASOS.map((paso, i) => (
              <li className="oc-paso" key={paso.titulo}>
                <span className="oc-paso-numero" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="oc-paso-titulo">{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
