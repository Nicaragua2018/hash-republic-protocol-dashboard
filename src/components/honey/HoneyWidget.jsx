import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EVENTO_RECORRIDO } from '../recorrido/logica.js';
import { CLASE_INTRO, EVENTO_INTRO_TERMINADA } from '../layout/IntroSplash.jsx';
import { honeyActivo, preguntar, votar, avisoPendiente, marcarAvisoVisto } from './honeyApi.js';
import './honey.css';

const PRESENTACION =
  'Hola, soy HONEY, el asistente de OpenCivic. Soy una IA y respondo con los documentos públicos del proyecto. No escribas aquí datos personales ni sensibles.';
// Solo preguntas que la base aprobada ya responde (honey/base/). Cambiarlas cuando crezca.
const SUGERIDAS = [
  '¿Qué es OpenCivic?',
  '¿Qué proyectos tienen?',
  '¿Cómo me suscribo al boletín?',
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
  const [aviso, setAviso] = useState(false);
  const { pathname } = useLocation();
  const navegar = useNavigate();
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

  // Primera visita: un globito presenta a HONEY unos segundos y no vuelve.
  useEffect(() => {
    if (!activo || !avisoPendiente()) return undefined;
    let mostrar, ocultar;
    // Se da por visto al aparecer: si la persona cambia de página, no se repite.
    const empezar = () => {
      mostrar = window.setTimeout(() => {
        setAviso(true);
        marcarAvisoVisto();
      }, 2500);
      ocultar = window.setTimeout(() => setAviso(false), 12000);
    };
    // Si la animación de bienvenida está en pantalla, se espera a que termine.
    if (document.documentElement.classList.contains(CLASE_INTRO)) {
      window.addEventListener(EVENTO_INTRO_TERMINADA, empezar, { once: true });
    } else {
      empezar();
    }
    return () => {
      window.removeEventListener(EVENTO_INTRO_TERMINADA, empezar);
      window.clearTimeout(mostrar);
      window.clearTimeout(ocultar);
    };
  }, [activo]);

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

  function cerrarAviso() {
    setAviso(false);
    marcarAvisoVisto();
  }

  function abrir() {
    cerrarAviso();
    setAbierto(true);
  }

  // El recorrido vive en Inicio: desde otra página, HONEY lleva allí.
  function recorrido() {
    setAbierto(false);
    if (pathname === '/') window.dispatchEvent(new Event(EVENTO_RECORRIDO));
    else navegar('/?recorrido');
  }

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
            <img src="/honey-avatar-96.webp" alt="" width="36" height="36" />
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
                <div className="honey-presentacion">
                  <img
                    src="/honey-avatar-cuerpo-240.webp"
                    alt="HONEY, una abejita azul y amarilla"
                    width="96"
                    height="96"
                  />
                  <p className="honey-burbuja honey-burbuja--asistente">{PRESENTACION}</p>
                </div>
                {mensajes.length === 0 && (
                  <div className="honey-sugeridas">
                    <button type="button" className="honey-sugerida-recorrido" onClick={recorrido}>
                      Hazme un recorrido por el sitio
                    </button>
                    {SUGERIDAS.map((s) => (
                      <button key={s} type="button" onClick={() => enviar(s)}>
                        {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="honey-sugerida-propia"
                      onClick={() => entradaRef.current?.focus()}
                    >
                      Escribe tu propia pregunta
                    </button>
                  </div>
                )}
                {mensajes.map((m, i) => (
                  <Mensaje key={i} m={m} onVotar={(util) => alVotar(i, util)} />
                ))}
                {escribiendo && (
                  <p className="honey-escribiendo" role="status" aria-label="HONEY está escribiendo">
                    <HoneyEscribiendo />
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
      {aviso && !abierto && (
        <div className="honey-aviso" role="status">
          <button type="button" className="honey-aviso-texto" onClick={abrir}>
            ¿Dudas? Pregúntale a HONEY
          </button>
          <button
            type="button"
            className="honey-aviso-cerrar"
            onClick={cerrarAviso}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}
      <button
        ref={botonRef}
        type="button"
        className="honey-boton"
        data-recorrido="honey"
        aria-label={abierto ? 'Cerrar el asistente HONEY' : 'Abrir el asistente HONEY'}
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar() : abrir())}
      >
        <img src="/honey-avatar-192.webp" alt="" width="58" height="58" />
      </button>
    </div>
  );
}

// HONEY escribiendo en su laptop (Marca/HONEY/HoneyEscribiendo.mp4, 50 KB, sin sonido).
// Con «reducir movimiento» se muestra el primer cuadro quieto.
function HoneyEscribiendo() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return (
      <img className="honey-escribiendo-video" src="/honey-escribiendo.webp" alt="" width="64" height="64" />
    );
  }
  return (
    <video
      className="honey-escribiendo-video"
      src="/honey-escribiendo.mp4"
      poster="/honey-escribiendo.webp"
      width="64"
      height="64"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}

function Mensaje({ m, onVotar }) {
  if (m.rol === 'usuario') {
    return <p className="honey-burbuja honey-burbuja--usuario">{m.texto}</p>;
  }
  return (
    <div className="honey-burbuja honey-burbuja--asistente">
      <p>{m.texto}</p>
      {m.fuentes
        .filter((f) => f.imagen)
        .map((f) => (
          <figure className="honey-imagen" key={f.imagen}>
            <img src={f.imagen} alt={f.imagen_alt} width="160" height="160" loading="lazy" />
            <figcaption>{f.imagen_alt}</figcaption>
          </figure>
        ))}
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
