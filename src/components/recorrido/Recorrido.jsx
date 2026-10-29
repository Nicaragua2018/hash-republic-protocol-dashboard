import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  EVENTO_RECORRIDO,
  PASOS,
  cimaDeseada,
  elegirObjetivo,
  pasosDisponibles,
  posicionTarjeta,
} from './logica.js';
import './recorrido.css';

const buscar = (id) => [...document.querySelectorAll(`[data-recorrido="${id}"]`)];
const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOLGURA = 8;

export default function Recorrido() {
  const [pasos, setPasos] = useState(null);
  const [indice, setIndice] = useState(0);
  const [foco, setFoco] = useState(null);
  const [posicion, setPosicion] = useState(null);
  const tarjetaRef = useRef(null);
  const anteriorRef = useRef(null);

  const empezar = useCallback(() => {
    anteriorRef.current = document.activeElement;
    // Sin ?recorrido en la dirección: recargar la página no lo repite.
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
    setPasos(pasosDisponibles(PASOS, buscar));
    setIndice(0);
  }, []);

  const terminar = useCallback(() => {
    setPasos(null);
    setFoco(null);
    setPosicion(null);
    anteriorRef.current?.focus?.();
  }, []);

  useEffect(() => {
    window.addEventListener(EVENTO_RECORRIDO, empezar);
    // Desde otra página, HONEY lleva a /?recorrido.
    if (new URLSearchParams(window.location.search).has('recorrido')) empezar();
    return () => window.removeEventListener(EVENTO_RECORRIDO, empezar);
  }, [empezar]);

  const paso = pasos?.[indice];

  // Mide el elemento del paso y coloca el foco y la tarjeta.
  const medir = useCallback(() => {
    if (!paso) return;
    const objetivo = elegirObjetivo(buscar(paso.id));
    if (!objetivo) return;
    const r = objetivo.getBoundingClientRect();
    setFoco({
      top: r.top - HOLGURA,
      left: r.left - HOLGURA,
      width: r.width + HOLGURA * 2,
      height: r.height + HOLGURA * 2,
    });
    const t = tarjetaRef.current?.getBoundingClientRect();
    setPosicion(
      posicionTarjeta(
        { top: r.top - HOLGURA, bottom: r.bottom + HOLGURA, left: r.left, width: r.width },
        { ancho: window.innerWidth, alto: window.innerHeight },
        { ancho: t?.width || 320, alto: t?.height || 220 }
      )
    );
  }, [paso]);

  // Al cambiar de paso: llevar el elemento a la vista y medir cuando llegue.
  useEffect(() => {
    if (!paso) return undefined;
    const objetivo = elegirObjetivo(buscar(paso.id));
    // El menú y la burbuja de HONEY no se mueven con la página: no hace falta desplazarla.
    if (objetivo && !paso.fijo) {
      const r = objetivo.getBoundingClientRect();
      const t = tarjetaRef.current?.getBoundingClientRect();
      const cabecera = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const cima = cimaDeseada(
        r.height + HOLGURA * 2,
        { ancho: window.innerWidth, alto: window.innerHeight },
        { ancho: t?.width || 340, alto: t?.height || 220 },
        cabecera
      );
      window.scrollBy({
        top: r.top - HOLGURA - cima,
        behavior: sinMovimiento() ? 'auto' : 'smooth',
      });
    }
    const espera = window.setTimeout(medir, sinMovimiento() ? 0 : 450);
    return () => window.clearTimeout(espera);
  }, [paso, medir]);

  useLayoutEffect(() => {
    if (!paso) return undefined;
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, { passive: true });
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir);
    };
  }, [paso, medir]);

  useEffect(() => {
    if (!paso) return undefined;
    tarjetaRef.current?.focus();
    const alPulsar = (e) => {
      if (e.key === 'Escape') terminar();
      if (e.key === 'ArrowRight') setIndice((i) => Math.min(i + 1, pasos.length - 1));
      if (e.key === 'ArrowLeft') setIndice((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [paso, pasos, terminar]);

  if (!paso) return null;
  const ultimo = indice === pasos.length - 1;

  return (
    <div className="oc-recorrido">
      <div className="oc-recorrido-fondo" onClick={terminar} aria-hidden="true" />
      {foco && <div className="oc-recorrido-foco" style={foco} aria-hidden="true" />}
      <div
        ref={tarjetaRef}
        className="oc-recorrido-tarjeta"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oc-recorrido-titulo"
        aria-describedby="oc-recorrido-texto"
        tabIndex={-1}
        style={posicion ?? { visibility: 'hidden' }}
      >
        <div className="oc-recorrido-cabecera">
          <img src="/opencivic-icono-192.png" alt="" width="32" height="32" />
          <h2 id="oc-recorrido-titulo">{paso.titulo}</h2>
          <button
            type="button"
            className="oc-recorrido-cerrar"
            onClick={terminar}
            aria-label="Salir del recorrido"
          >
            ×
          </button>
        </div>
        <p id="oc-recorrido-texto">{paso.texto}</p>
        <div className="oc-recorrido-pie">
          <span aria-live="polite">
            {indice + 1} de {pasos.length}
          </span>
          <div>
            {indice > 0 && (
              <button type="button" className="oc-recorrido-boton" onClick={() => setIndice(indice - 1)}>
                Anterior
              </button>
            )}
            <button
              type="button"
              className="oc-recorrido-boton oc-recorrido-boton--principal"
              onClick={() => (ultimo ? terminar() : setIndice(indice + 1))}
            >
              {ultimo ? 'Terminar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
