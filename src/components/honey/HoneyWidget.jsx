import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { honeyActivo, preguntar, votar } from './honeyApi.js';
import './honey.css';

const PRESENTACION =
  'Hola, soy HONEY, el asistente de OpenCivic. Soy una IA y respondo con los documentos públicos del proyecto. No escribas aquí datos personales ni sensibles.';
// Solo preguntas que la base aprobada ya responde (honey/base/). Cambiarlas cuando crezca.
const SUGERIDAS = [
  '¿Qué es OpenCivic?',
  '¿Qué proyectos tienen?',
  '¿Qué licencia usan?',
  '¿Quién está detrás de OpenCivic?',
];
const POLITICA_ANTHROPIC = 'https://www.anthropic.com/legal/privacy';

export default function HoneyWidget() {
  const [activo, setActivo] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState('chat');
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const botonRef = useRef(null);
  const entradaRef = useRef(null);
  const finRef = useRef(null);

  useEffect(() => {
    let vigente = true;
    honeyActivo().then((ok) => vigente && setActivo(ok));
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (abierto && vista === 'chat') entradaRef.current?.focus();
  }, [abierto, vista]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsar = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [abierto]);

  if (!activo) return null;

  function cerrar() {
    setAbierto(false);
    botonRef.current?.focus();
  }

  async function enviar(texto) {
    const pregunta = texto.trim();
    if (!pregunta || escribiendo) return;
    // recortarHistorial deja solo rol y texto, y descarta los intercambios fallidos.
    const historial = mensajes;
    setMensajes((ms) => [...ms, { rol: 'usuario', texto: pregunta }]);
    setEntrada('');
    setEscribiendo(true);
    const respuesta = await preguntar(pregunta, historial);
    setMensajes((ms) => [...ms, { rol: 'asistente', ...respuesta, voto: null }]);
    setEscribiendo(false);
  }

  function alVotar(indice, util) {
    const m = mensajes[indice];
    if (!m.id || m.voto !== null) return;
    setMensajes((ms) => ms.map((x, i) => (i === indice ? { ...x, voto: util } : x)));
    votar(m.id, util);
  }

  return (
    <div className="honey">
      {abierto && (
        <div className="honey-panel" role="dialog" aria-modal="false" aria-labelledby="honey-titulo">
          <header className="honey-cabecera">
            <img src="/opencivic-icono-192.png" alt="" width="32" height="32" />
            <h2 id="honey-titulo">HONEY · asistente IA de OpenCivic</h2>
            <button type="button" className="honey-cerrar" onClick={cerrar} aria-label="Cerrar el asistente">
              ×
            </button>
          </header>
          {vista === 'privacidad' ? (
            <Privacidad onVolver={() => setVista('chat')} />
          ) : (
            <>
              <div className="honey-mensajes" aria-live="polite">
                <p className="honey-burbuja honey-burbuja--asistente">{PRESENTACION}</p>
                {mensajes.length === 0 && (
                  <div className="honey-sugeridas">
                    {SUGERIDAS.map((s) => (
                      <button key={s} type="button" onClick={() => enviar(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {mensajes.map((m, i) => (
                  <Mensaje key={i} m={m} onVotar={(util) => alVotar(i, util)} />
                ))}
                {escribiendo && (
                  <p className="honey-escribiendo" role="status" aria-label="HONEY está escribiendo">
                    <span />
                    <span />
                    <span />
                  </p>
                )}
                <div ref={finRef} />
              </div>
              <form
                className="honey-formulario"
                onSubmit={(e) => {
                  e.preventDefault();
                  enviar(entrada);
                }}
              >
                <label htmlFor="honey-entrada" className="honey-oculto">
                  Tu pregunta
                </label>
                <input
                  id="honey-entrada"
                  ref={entradaRef}
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  maxLength={500}
                  placeholder="Escribe tu pregunta"
                  autoComplete="off"
                />
                <button type="submit" disabled={escribiendo || !entrada.trim()}>
                  Enviar
                </button>
              </form>
            </>
          )}
          <footer className="honey-pie">
            HONEY es una IA y puede equivocarse. No compartas datos personales.{' '}
            <button type="button" className="honey-enlace" onClick={() => setVista('privacidad')}>
              Privacidad
            </button>
          </footer>
        </div>
      )}
      <button
        ref={botonRef}
        type="button"
        className="honey-boton"
        aria-label={abierto ? 'Cerrar el asistente HONEY' : 'Abrir el asistente HONEY'}
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <img src="/opencivic-icono-192.png" alt="" width="44" height="44" />
      </button>
    </div>
  );
}

function Mensaje({ m, onVotar }) {
  if (m.rol === 'usuario') {
    return <p className="honey-burbuja honey-burbuja--usuario">{m.texto}</p>;
  }
  return (
    <div className="honey-burbuja honey-burbuja--asistente">
      <p>{m.texto}</p>
      {m.estado === 'sin_respuesta' && (
        <p>
          <Link to="/contacto">Escribir al equipo</Link>
        </p>
      )}
      {m.fuentes.length > 0 && (
        <p className="honey-fuentes">
          Fuente:{' '}
          {m.fuentes.map((f, i) => (
            <React.Fragment key={f.url + f.titulo}>
              {i > 0 && ' · '}
              <Link to={f.url}>{f.titulo}</Link>
            </React.Fragment>
          ))}
        </p>
      )}
      {m.id &&
        (m.voto === null ? (
          <div className="honey-voto">
            <button type="button" onClick={() => onVotar(true)}>
              Útil
            </button>
            <button type="button" onClick={() => onVotar(false)}>
              No útil
            </button>
          </div>
        ) : (
          <p className="honey-gracias">Gracias por tu opinión.</p>
        ))}
    </div>
  );
}

function Privacidad({ onVolver }) {
  return (
    <div className="honey-privacidad">
      <h3>Privacidad</h3>
      <p>
        HONEY no te pide nombre ni correo, no usa cookies y no guarda nada en tu navegador. La conversación se
        borra al cerrar la pestaña.
      </p>
      <p>
        Antes de procesar tu pregunta, el servidor de OpenCivic borra correos, teléfonos, cédulas y tarjetas.
        Luego la envía a Anthropic, la empresa que provee el modelo de IA, para redactar la respuesta.
      </p>
      <p>
        OpenCivic guarda la pregunta ya filtrada, la respuesta y tu voto durante 30 días para mejorar las
        preguntas frecuentes. No guarda tu dirección IP.
      </p>
      <p>
        <a href={POLITICA_ANTHROPIC} target="_blank" rel="noopener noreferrer">
          Política de privacidad de Anthropic
        </a>
      </p>
      <button type="button" className="honey-volver" onClick={onVolver}>
        Volver al chat
      </button>
    </div>
  );
}
