import React from 'react';

const PRINCIPLES = [
  'La identidad no es reputación.',
  'La reputación no es soberanía.',
  'La delegación no es sumisión.',
  'La pericia no es autoridad absoluta.',
  'El consenso no es coerción.',
  'Las señales no son votos vinculantes.',
  'La síntesis de IA no es ley.',
  'La auditoría protege la delegación.',
  'La competencia puede guiar el consenso, pero no poseerlo.',
  'La comunidad puede delegar juicio, pero nunca ceder soberanía.',
  'Nadie habla por Bitcoin; la evidencia habla por sí misma.',
  'Ninguna propuesta sin deliberación.',
  'Ninguna ejecución sin auditoría.',
  'Ninguna reputación sin evidencia.',
  'Ninguna delegación sin revocación.',
  'El consenso bruto debe permanecer visible.',
  'El consenso ponderado debe declarar su método.',
  'Las preocupaciones minoritarias deben preservarse.',
  'El almacenamiento no es autoridad.',
  'La verificabilidad es autoridad.',
  'La ley gobierna al código. Todo código institucional es reversible, actualizable e impugnable.',
  'Automatizar procedimientos no es automatizar soberanía.',
  'La soberanía tecnológica pertenece a la comunidad. Ningún componente es insustituible; los datos son siempre exportables.',
  'Descentralizar infraestructura no es descentralizar poder. El poder se mide, no se presume.',
  'Algunas cosas no se convierten en código: la empatía, la excepción, la negociación, la justicia, la responsabilidad y la capacidad de cambiar de opinión.',
];

export default function About() {
  return (
    <>
      <section className="oc-section" style={{ paddingTop: 56 }}>
        <div className="oc-container">
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
          <h2 className="oc-h2">Los límites que no se negocian</h2>
          <details className="oc-details">
            <summary>Ver los 25 principios</summary>
            <ol>
              {PRINCIPLES.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </details>
        </div>
      </section>
    </>
  );
}
