import React, { useEffect, useId, useRef, useState } from 'react';
import { ESCENAS, ALT_FIJA } from '../content/videoColmena';

// El mismo video de la portada de nicaraguadecide.org: arranca solo, sin
// sonido y en bucle. Quien prefiere menos movimiento ve la imagen fija.

const POSTER = '/nicaragua-decide/colmena-final.webp';
const MP4 = '/nicaragua-decide/colmena.mp4';

const svg = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export default function VideoColmena() {
  const idTextos = useId();
  const videoRef = useRef(null);
  const [reducir, setReducir] = useState(false);
  const [silenciado, setSilenciado] = useState(true);
  const [pausado, setPausado] = useState(false);
  // Si el video no carga, queda la imagen fija y sobran los botones.
  const [sinVideo, setSinVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducir(mq.matches);
    const alCambiar = (e) => setReducir(e.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  useEffect(() => {
    if (reducir) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setSilenciado(true);
    // Si el navegador bloquea el autoplay, queda en pausa con la imagen fija.
    v.play().then(
      () => setPausado(false),
      () => setPausado(v.paused)
    );
  }, [reducir]);

  function alternarSonido() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setSilenciado(v.muted);
  }

  function alternarPausa() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPausado(true));
    else v.pause();
  }

  const textos = (
    <ol id={idTextos} className="oc-solo-lectores" aria-label="Textos que aparecen en el video">
      {ESCENAS.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ol>
  );

  if (reducir || sinVideo) {
    return (
      <div className="oc-video-bloque">
        <div className="oc-video-marco">
          <img src={POSTER} alt={ALT_FIJA} width="1080" height="1080" />
        </div>
        {textos}
      </div>
    );
  }

  return (
    <div className="oc-video-bloque">
      <div className="oc-video-marco">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
          width="1080"
          height="1080"
          aria-label="Video sin voz de la colmena de Nicaragua Decide, en cinco escenas"
          aria-describedby={idTextos}
          onPlay={() => setPausado(false)}
          onPause={() => setPausado(true)}
          onVolumeChange={(e) => setSilenciado(e.currentTarget.muted)}
          onError={() => setSinVideo(true)}
        >
          <source src={MP4} type="video/mp4" onError={() => setSinVideo(true)} />
        </video>
      </div>
      {/* Etiquetas fijas con aria-pressed: «Sonido, presionado» = suena; «Pausa, presionado» = en pausa. */}
      <div className="oc-video-controles">
        <button
          type="button"
          className="oc-video-control"
          aria-pressed={!silenciado}
          onClick={alternarSonido}
        >
          <svg {...svg}>
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {silenciado ? (
              <path d="M22 9l-6 6M16 9l6 6" />
            ) : (
              <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
            )}
          </svg>
          <span>Sonido</span>
        </button>
        <button type="button" className="oc-video-control" aria-pressed={pausado} onClick={alternarPausa}>
          <svg {...svg}>{pausado ? <path d="M7 5l12 7-12 7V5z" /> : <path d="M9 5v14M15 5v14" />}</svg>
          <span>Pausa</span>
        </button>
      </div>
      {textos}
    </div>
  );
}
