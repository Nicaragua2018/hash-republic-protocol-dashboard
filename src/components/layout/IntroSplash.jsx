import React, { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'oc-intro-seen';

export default function IntroSplash() {
  const videoRef = useRef(null);
  const [phase, setPhase] = useState('hidden'); // hidden | playing | needs-tap | leaving | done

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

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay with sound was blocked — ask for a tap, which counts
        // as a user gesture and allows audio to play.
        setPhase('needs-tap');
      });
    }
  }, [phase]);

  const finish = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('leaving');
    window.setTimeout(() => setPhase('done'), 400);
  };

  const handleTap = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.play().catch(() => {});
    }
    setPhase('playing');
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
        background: 'var(--oc-white, #fff)',
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
        onEnded={finish}
        onClick={phase === 'needs-tap' ? handleTap : undefined}
        style={{ width: 'min(70vw, 420px)', cursor: phase === 'needs-tap' ? 'pointer' : 'default' }}
      />

      {phase === 'needs-tap' && (
        <button
          onClick={handleTap}
          style={{
            position: 'absolute',
            bottom: '18%',
            padding: '12px 24px',
            borderRadius: 999,
            border: '2px solid var(--oc-blue, #0A3880)',
            background: '#fff',
            color: 'var(--oc-blue, #0A3880)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Toca para entrar
        </button>
      )}

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
