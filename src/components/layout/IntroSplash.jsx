import React, { useRef, useState, useEffect } from 'react';

const SESSION_KEY = 'oc-intro-seen';

export default function IntroSplash() {
  const videoRef = useRef(null);
  const [phase, setPhase] = useState('hidden'); // hidden | playing | leaving | done

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || reducedMotion) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setPhase('done');
      return;
    }

    setPhase('playing');
  }, []);

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

  const finish = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('leaving');
    window.setTimeout(() => setPhase('done'), 400);
  };

  if (phase === 'hidden' || phase === 'done') return null;

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
