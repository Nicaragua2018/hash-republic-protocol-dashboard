import React, { useRef, useState, useEffect } from 'react';

const SESSION_KEY = 'oc-intro-seen';

// Mientras la intro está en pantalla, <html> lleva esta clase; al terminar se
// avisa con EVENTO_INTRO_TERMINADA (HONEY espera a ese aviso para presentarse).
export const CLASE_INTRO = 'oc-intro-activa';
export const EVENTO_INTRO_TERMINADA = 'oc:intro-terminada';

// sessionStorage throws when the browser blocks site storage (for example
// with "block all cookies"). Failing to remember the intro must never take
// the whole page down, so both reads and writes are best-effort.
const wasSeen = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Without storage the intro simply plays again on the next visit.
  }
};

export default function IntroSplash() {
  const videoRef = useRef(null);
  // Decided on the first render (this site only renders in the browser),
  // so returning visitors never see a flash of the splash.
  const [phase, setPhase] = useState(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return wasSeen() || reducedMotion ? 'done' : 'playing';
  }); // playing | leaving | done

  const finish = () => {
    setPhase('leaving');
    window.setTimeout(() => setPhase('done'), 400);
  };

  // Skipped or finished, the intro does not play again in this session.
  useEffect(() => {
    if (phase === 'done') {
      markSeen();
      document.documentElement.classList.remove(CLASE_INTRO);
      window.dispatchEvent(new Event(EVENTO_INTRO_TERMINADA));
    } else {
      document.documentElement.classList.add(CLASE_INTRO);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const video = videoRef.current;
    if (!video) return;

    // Try with sound first. Browsers that block unmuted autoplay on a
    // first visit reject the promise — fall back to a muted autoplay so
    // the animation still starts immediately, just silently.
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => finish());
    });
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      role="dialog"
      aria-label="Animación de bienvenida de OpenCivic Solutions"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--oc-mist, #F4F6FA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'leaving' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <video
        ref={videoRef}
        src="/intro-logo-sonido.mp4"
        playsInline
        autoPlay
        onEnded={finish}
        style={{
          width: 'min(70vw, 420px)',
          aspectRatio: '1 / 1',
          borderRadius: 24,
          background: '#fff',
        }}
      />

      <button
        onClick={finish}
        aria-label="Saltar introducción"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'transparent',
          border: 'none',
          color: 'var(--oc-blue, #0A3880)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 12px',
        }}
      >
        Saltar &rarr;
      </button>
    </div>
  );
}
