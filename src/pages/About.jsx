import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';
import principles from '../content/principles';

export default function About() {
  const { hash } = useLocation();

  // The page is rendered client-side, so a direct visit to
  // /sobre#principio-N arrives before the target exists; scroll once it does.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Seo {...PAGES['/sobre']} />
      <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative' }}>
          <span className="oc-eyebrow">Qué es OpenCivic Solutions</span>
          <h1 className="oc-h1">Por qué existimos</h1>
          <p className="oc-lede">
            Las leyes, los parlamentos, las cooperativas y las elecciones son herramientas que la
            humanidad inventó para cooperar. Si hemos reinventado las tecnologías con las que
            producimos, viajamos y nos comunicamos, no hay razón para suponer que llegamos al
            final de la innovación en las que usamos para participar y gobernarnos.
          </p>
          <p style={{ maxWidth: 680 }}>
            OpenCivic existe para innovar en esas tecnologías institucionales persiguiendo siempre
            la <strong>paz social</strong> y el <strong>bien común</strong>, sin pasar nunca por
            encima de la <strong>esperanza</strong>, la <strong>justicia</strong> ni la{' '}
            <strong>dignidad humana</strong> de ningún individuo ni de ninguna minoría.
          </p>
          <div className="oc-card" style={{ maxWidth: 680, borderLeft: '4px solid var(--oc-yellow)', marginTop: 16 }}>
            <strong>Regla de interpretación.</strong> Todo documento, producto y decisión de
            OpenCivic se lee a la luz de esta razón de ser. Ningún objetivo colectivo, ninguna
            eficiencia técnica y ninguna mayoría justifican cruzar esos límites.
          </div>
          <p style={{ maxWidth: 680, marginTop: 16 }}>
            El conocimiento y la tecnología nacen de la cooperación y de la herencia de las
            generaciones pasadas: son <strong>patrimonio de la humanidad</strong>. Por eso todo lo
            que hacemos es abierto.
          </p>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container" style={{ display: 'grid', gap: 32, alignItems: 'center' }} >
          <img src="/ilustracion-asamblea.jpg" alt="Una comunidad diversa reunida alrededor de una mesa, deliberando frente a un tablero con notas" className="oc-illustration" />
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container">
          <span className="oc-eyebrow">La fórmula</span>
          <h2 className="oc-h2">Democracia, competencia, criptografía y constitución</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="oc-table">
              <thead>
                <tr>
                  <th>Pieza</th>
                  <th>Su trabajo</th>
                  <th>Su límite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Democracia</strong></td>
                  <td>para la soberanía</td>
                  <td>El resultado sin ponderar siempre queda a la vista.</td>
                </tr>
                <tr>
                  <td><strong>Competencia verificable</strong></td>
                  <td>para el juicio técnico</td>
                  <td>El peso adicional es de 1,3× como máximo y solo se gana con capacidad técnica y experiencia verificables en un dominio.</td>
                </tr>
                <tr>
                  <td><strong>Criptografía</strong></td>
                  <td>para la prueba</td>
                  <td>Informes con huella digital y sello de tiempo, que cualquiera puede comprobar.</td>
                </tr>
                <tr>
                  <td><strong>Constitución</strong></td>
                  <td>para los límites</td>
                  <td>Principios escritos que ninguna mayoría, eficiencia ni objetivo colectivo puede cruzar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container" style={{ display: 'grid', gap: 32 }}>
          <img src="/encabezado-workspace.svg" alt="" aria-hidden="true" style={{ width: '100%', borderRadius: 'var(--oc-radius)' }} />
          <div>
            <span className="oc-eyebrow">El espacio de trabajo de agentes</span>
            <h2 className="oc-h2">Un equipo de IA, coordinado por una persona</h2>
            <p className="oc-lede">
              OpenCivic trabaja con un equipo de agentes de IA coordinado por un agente CEO. Los
              agentes investigan, redactan y preparan; una persona aprueba antes de que nada se
              publique. Este es un proyecto público: los archivos de trabajo nunca contienen datos
              personales, contraseñas ni identidades de personas en riesgo.
            </p>
          </div>
          <img src="/ilustracion-taller.jpg" alt="Una facilitadora explica un diagrama de hexágonos conectados a personas que toman notas" className="oc-illustration" />
        </div>
      </section>

      <section className="oc-section">
        <div className="oc-container">
          <span className="oc-eyebrow">Principios</span>
          <h2 className="oc-h2" id="principios" style={{ scrollMarginTop: 96 }}>Los límites que no se negocian</h2>
          <p className="oc-lede" style={{ marginBottom: 24 }}>
            Veinticinco principios que ningún proyecto de OpenCivic puede cruzar. Pulsa cualquiera
            para leer qué significa.
          </p>
          <ol className="oc-principles">
            {principles.map((p, i) => (
              <li key={i}>
                <a href={`#principio-${i + 1}`}>{p.text}</a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container" style={{ maxWidth: 820 }}>
          <h2 className="oc-h2">Qué significa cada principio</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: 24 }}>
            Explicaciones redactadas con asistencia de IA, con revisión y autorización humana.
          </p>
          {principles.map((p, i) => (
            <article key={i} id={`principio-${i + 1}`} className="oc-card oc-principle">
              <span className="oc-principle__num">{i + 1}</span>
              <h3 style={{ fontSize: '1.05rem' }}>{p.text}</h3>
              <p style={{ fontSize: '0.95rem' }}>{p.explain}</p>
              <a href="#principios" style={{ fontSize: '0.85rem', fontWeight: 600 }}>↑ Volver a la lista</a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
