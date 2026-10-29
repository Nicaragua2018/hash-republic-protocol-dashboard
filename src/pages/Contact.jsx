import React from 'react';
import Seo from '../components/Seo';
import { PAGES } from '../content/seo';

export default function Contact() {
  return (
    <>
      <Seo {...PAGES['/contacto']} />
      <section className="oc-section oc-hero" style={{ paddingTop: 56 }}>
        <div className="oc-hero-bees" aria-hidden="true" />
        <div className="oc-container" style={{ position: 'relative' }}>
          <span className="oc-eyebrow">Contacto</span>
          <h1 className="oc-h1">Escríbenos</h1>
          <p className="oc-lede" style={{ maxWidth: 680 }}>
            ¿Tienes una pregunta, una propuesta o quieres reportar un problema? Escríbenos a{' '}
            <a href="mailto:info@opencivicsolutions.org">info@opencivicsolutions.org</a>. Para dudas rápidas
            sobre el sitio, también puedes preguntarle a HONEY, el asistente del botón de abajo a la derecha.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0 48px' }}>
            <a href="mailto:info@opencivicsolutions.org" className="oc-btn oc-btn--primary">
              Escribir un correo
            </a>
            <a
              href="https://github.com/Nicaragua2018/hash-republic-protocol-dashboard"
              className="oc-btn oc-btn--outline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
          <h2 className="oc-h2">Confianza</h2>
          <ul style={{ maxWidth: 680, fontSize: '1rem', lineHeight: 1.9, paddingLeft: 20 }}>
            <li>
              <strong>Canales oficiales:</strong> solo los que figuran en este sitio. Si un mensaje o un video
              aparece fuera de ellos, no es nuestro.
            </li>
            <li>
              <strong>IA declarada:</strong> todo contenido generado o asistido por IA se etiqueta, y todo
              clon digital figura en un registro público con el consentimiento de la persona.
            </li>
            <li>
              <strong>Imparcialidad:</strong> criticamos con la misma vara al Estado, al capital, a la mayoría
              y a la utopía tecnológica. No hacemos propaganda partidaria.
            </li>
            <li>
              <strong>Seguridad:</strong> para reportar una vulnerabilidad o una suplantación, escribe a{' '}
              <a href="mailto:info@opencivicsolutions.org">info@opencivicsolutions.org</a>.
            </li>
          </ul>
        </div>
      </section>

      <section className="oc-section oc-section--mist">
        <div className="oc-container">
          <h2 className="oc-h2">Licencias</h2>
          <p className="oc-lede" style={{ marginBottom: 24 }}>
            Lo que se comparte y se mejora sigue siendo de todos.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="oc-table">
              <thead>
                <tr>
                  <th>Qué</th>
                  <th>Licencia</th>
                  <th>En pocas palabras</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Código</strong>
                  </td>
                  <td>GNU AGPL v3</td>
                  <td>
                    Puedes usarlo, cambiarlo y redistribuirlo. Si lo ofreces como servicio en internet,
                    compartes tus cambios con la misma licencia.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Contenido</strong> (textos, imágenes, diseño)
                  </td>
                  <td>CC BY-SA 4.0</td>
                  <td>
                    Puedes copiarlo y adaptarlo citando a OpenCivic y compartiendo con la misma licencia.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Datos abiertos</strong>
                  </td>
                  <td>ODbL 1.0</td>
                  <td>
                    Puedes usar y adaptar las bases de datos citando la fuente y manteniendo abiertas las
                    versiones derivadas.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.9rem' }}>
            El logo y el nombre de OpenCivic identifican a la organización: puedes mostrarlos para referirte a
            nosotros, pero no para hacerte pasar por nosotros.
          </p>
        </div>
      </section>
    </>
  );
}
