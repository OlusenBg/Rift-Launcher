import { useState, useEffect } from 'react';
import { Logo } from '../shared/Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 4000);
    const t3 = setTimeout(onComplete, 4750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 36,
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.75s var(--ease-out)' : 'none',
        pointerEvents: phase === 'exit' ? 'none' : 'auto',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-55%)',
          width: 640,
          height: 440,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, rgba(34,211,238,0.05) 50%, transparent 70%)',
          animation: 'lcGlow 5s ease-in-out infinite',
        }}
      />

      {/* Logo + wordmark */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(12px) scale(0.95)' : 'translateY(0) scale(1)',
          transition: 'opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out)',
        }}
      >
        <Logo size={80} showWord={false} />
        <span
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Modrift
        </span>
      </div>

      {/* Arc spinner */}
      <div
        style={{
          opacity: phase === 'enter' ? 0 : 0.85,
          transition: 'opacity 0.6s 0.6s var(--ease-out)',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '2px solid rgba(124,58,237,0.18)',
            borderTopColor: 'var(--accent)',
            animation: 'lcSpin 0.8s linear infinite',
          }}
        />
      </div>

      {/* Version label */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          opacity: phase === 'enter' ? 0 : 0.6,
          transition: 'opacity 0.6s 1s',
        }}
      >
        v0.1.0 — Rift Launcher
      </div>
    </div>
  );
}
