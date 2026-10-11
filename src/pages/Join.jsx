import React from 'react';

const WAYS = [
  { title: 'Programar', detail: 'Código abierto en cada repositorio de proyecto, con tareas marcadas para principiantes.' },
  { title: 'Investigar', detail: 'Verificar fuentes, modelar riesgos, documentar casos de estudio como vTaiwan o Nepal 2025.' },
  { title: 'Diseñar', detail: 'Ilustración, UI y sistemas de diseño que sigan el manual de marca de OpenCivic.' },
  { title: 'Traducir', detail: 'Al inglés, francés o portugués — el mismo contenido, el mismo tono, no traducciones literales.' },
  { title: 'Enseñar', detail: 'Explicar estos protocolos a comunidades que todavía no los conocen.' },
];

export default function Join() {
  return (
    <>
      <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative' }}>
          <span className="oc-eyebrow">Unirse</span>
          <h1 className="oc-h1">Cómo contribuir</h1>
          <p className="oc-lede">
            Hay lugar para quien programa, investiga, diseña, traduce o enseña. Puedes participar
            con seudónimo. No compartas en issues ni en pull requests información que pueda
            identificarte a ti o a otras personas en riesgo.
          </p>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <img
            src="/ilustracion-asamblea.jpg"
            alt="Una comunidad diversa reunida alrededor de una mesa, deliberando frente a un tablero con notas"
            className="oc-illustration"
            style={{ marginBottom: 32 }}
          />
          <div className="oc-grid oc-grid--3">
            {WAYS.map((w) => (
              <div className="oc-card" key={w.title}>
                <h3>{w.title}</h3>
                <p style={{ fontSize: '0.92rem' }}>{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container">
          <h2 className="oc-h2">Tres pasos</h2>
          <ol style={{ maxWidth: 640, paddingLeft: 20, fontSize: '1rem', lineHeight: 1.8 }}>
            <li>
              Lee las bases de SOUL.md: ahí están los límites que no se negocian en cualquier
              proyecto de OpenCivic.
            </li>
            <li>Busca una tarea marcada para principiantes en el repositorio del proyecto que te interese.</li>
            <li>
              Abre un pull request con tus fuentes: si una afirmación no se puede verificar, no
              se publica.
            </li>
          </ol>
          <a
            href="https://github.com/Nicaragua2018/hash-republic-protocol-dashboard"
            className="oc-btn oc-btn--primary"
            target="_blank"
            rel="noreferrer"
          >
            Ver el repositorio en GitHub
          </a>
        </div>
      </section>
    </>
  );
}
