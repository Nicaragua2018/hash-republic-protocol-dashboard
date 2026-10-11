import React, { useRef, useState, useEffect } from 'react';

const SESSION_KEY = 'oc-intro-seen';

export default function IntroSplash() {
  const videoRef = useRef(null);
  // hidden | ready (branded card, waiting for a tap) | playing | leaving | done
  const [phase, setPhase] = useState('hidden');

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || reducedMotion) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setPhase('done');
      return;
    }

    setPhase('ready');
  }, []);

  const finish = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('leaving');
    window.setTimeout(() => setPhase('done'), 400);
  };

  const handleEnter = () => {
    setPhase('playing');
    // Play on the next tick so the <video> is already mounted and visible.
    window.setTimeout(() => {
      const video = videoRef.current;
      if (video) video.play().catch(() => finish());
    }, 0);
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
      {phase === 'playing' ? (
        <video
          ref={videoRef}
          src="/intro-logo-sonido.mp4"
          playsInline
          onEnded={finish}
          style={{
            width: 'min(70vw, 420px)',
            aspectRatio: '1 / 1',
            borderRadius: 24,
            background: '#fff',
          }}
        />
      ) : (
        <button
          onClick={handleEnter}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 24,
          }}
        >
          <img
            src="/opencivic-icono-color.svg"
            alt=""
            aria-hidden="true"
            style={{ width: 'min(40vw, 160px)' }}
            className="oc-intro-pulse"
          />
          <span
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              border: '2px solid var(--oc-blue, #0A3880)',
              background: '#fff',
              color: 'var(--oc-blue, #0A3880)',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Toca para entrar
          </span>
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

      <style>{`
        @keyframes oc-intro-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .oc-intro-pulse {
          animation: oc-intro-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
