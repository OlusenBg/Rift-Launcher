import React, { useState, useEffect } from 'react';
import { Logo } from '../shared/Logo';
import { Icon, LIcon } from '../shared/Icons';
import { startAuth, type MinecraftProfile } from '../../hooks/useAuth';

interface LoginScreenProps {
  onLogin: (profile: MinecraftProfile) => void;
  onGuest: () => void;
}

interface AuthBtnProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  primary?: boolean;
  onClick: () => void;
}

function AuthBtn({ icon, label, primary, onClick }: AuthBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 11,
        padding: '14px 22px',
        background: primary ? (hov ? 'var(--gradient-primary)' : 'var(--surface)') : 'transparent',
        border: primary
          ? `1px solid ${hov ? 'transparent' : 'var(--border-solid)'}`
          : `1px solid ${hov ? 'rgba(124,58,237,0.45)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-btn)',
        color: primary ? 'var(--text-primary)' : hov ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 14.5,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: primary && hov ? 'var(--glow-accent)' : 'none',
        transform: hov ? 'translateY(-1px)' : 'none',
        transition: 'all 0.18s var(--ease-out)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function AnimatedShowcase() {
  const [progress, setProgress] = useState(34);
  const [logLines, setLogLines] = useState([
    { id: 1, text: 'Loaded Rift loader v1.4.2', ok: true },
    { id: 2, text: 'Resolved 47 mod dependencies', ok: true },
    { id: 3, text: 'No conflicts detected', ok: true },
  ]);

  // Cycle progress bar
  useEffect(() => {
    let p = 34;
    const t = setInterval(() => {
      p = p >= 100 ? 0 : p + 0.9;
      setProgress(Math.round(p));
    }, 50);
    return () => clearInterval(t);
  }, []);

  // Cycle log lines
  const pool = [
    { text: 'Checking for updates…', ok: false },
    { text: 'Downloading Create v0.5.1f', ok: false },
    { text: 'Verifying file integrity', ok: false },
    { text: 'Installing Create v0.5.1f', ok: false },
    { text: 'No conflicts detected', ok: true },
    { text: 'Resolving dependencies', ok: false },
    { text: 'All mods loaded', ok: true },
    { text: 'Ready to launch', ok: true },
  ];

  useEffect(() => {
    let idx = 3;
    const t = setInterval(() => {
      setLogLines((prev) => [...prev, { id: Date.now(), ...pool[idx++ % pool.length] }].slice(-4));
    }, 1700);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* BG glow */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '45%',
          transform: 'translate(-50%,-50%)',
          width: 560,
          height: 480,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.16) 0%, rgba(34,211,238,0.04) 55%, transparent 72%)',
          animation: 'lcGlow 7s ease-in-out infinite',
        }}
      />

      {/* Mini grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.4,
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, #000 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 20%, transparent 70%)',
        }}
      />

      {/* Floating launcher window */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 390,
          animation: 'lcFloat 5.5s ease-in-out infinite',
          transform: 'perspective(900px) rotateY(-7deg) rotateX(4deg)',
        }}
      >
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 13px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(7,13,23,0.9)',
            }}
          >
            <div style={{ display: 'flex', gap: 5 }}>
              {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map((c) => (
                <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 10.5,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Modrift Launcher
            </span>
          </div>
          {/* App shell */}
          <div style={{ display: 'flex', height: 272 }}>
            {/* Mini sidebar */}
            <div
              style={{
                width: 118,
                borderRight: '1px solid var(--border)',
                padding: '9px 7px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ padding: '3px 7px 10px' }}>
                <Logo size={15} />
              </div>
              {[
                { s: 'Instances', a: true },
                { s: 'Mods', a: false },
                { s: 'Modpacks', a: false },
                { s: 'Discover', a: false },
              ].map(({ s, a }) => (
                <div
                  key={s}
                  style={{
                    padding: '5px 7px',
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    color: a ? 'var(--accent-light)' : 'var(--text-secondary)',
                    background: a ? 'var(--accent-dim)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 2,
                      background: a ? 'var(--accent)' : 'var(--surface-2)',
                      flexShrink: 0,
                    }}
                  />
                  {s}
                </div>
              ))}
            </div>
            {/* Mini content */}
            <div
              style={{
                flex: 1,
                padding: '10px 11px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                INSTANCES
              </div>
              {[
                {
                  name: 'Survival Overhaul',
                  v: '1.21.1',
                  mods: 47,
                  grad: 'linear-gradient(135deg, #1a0a3a, #2d1b69)',
                  running: false,
                },
                {
                  name: 'Tech Mods Pack',
                  v: '1.20.4',
                  mods: 82,
                  grad: 'linear-gradient(135deg, #0a1a2a, #1a3050)',
                  running: true,
                },
              ].map((inst) => (
                <div
                  key={inst.name}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 7,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      alignSelf: 'stretch',
                      background: inst.grad,
                      flexShrink: 0,
                      minHeight: 36,
                    }}
                  />
                  <div style={{ padding: '6px 9px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inst.name}
                    </div>
                    <div
                      style={{
                        fontSize: 8.5,
                        color: 'var(--text-muted)',
                        marginTop: 1,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {inst.v} · {inst.mods} mods
                    </div>
                  </div>
                  <div style={{ padding: '0 8px', flexShrink: 0 }}>
                    {inst.running ? (
                      <span
                        style={{
                          fontSize: 7.5,
                          fontWeight: 700,
                          color: 'var(--ok)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        ● RUN
                      </span>
                    ) : (
                      <div
                        style={{
                          width: 22,
                          height: 13,
                          borderRadius: 3,
                          background: 'var(--gradient-primary)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon.play s={6} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Install progress */}
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  padding: '7px 9px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Installing Create v0.5.1f
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: 'var(--accent-light)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {progress}%
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: 'var(--border)',
                    borderRadius: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: 'var(--gradient-primary)',
                      borderRadius: 100,
                      transition: 'width 0.05s linear',
                    }}
                  />
                </div>
              </div>
              {/* Log */}
              <div
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  overflow: 'hidden',
                }}
              >
                {logLines.map((l, i) => (
                  <div
                    key={l.id}
                    style={{
                      color: l.ok ? 'var(--ok)' : 'var(--text-muted)',
                      opacity: i === 0 ? 0.4 : 1,
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {l.ok ? '✓' : '→'} {l.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating feature pills */}
      {[
        { label: 'No conflicts', color: 'var(--ok)', top: '18%', left: '8%', delay: '0s' },
        { label: 'One-click install', color: 'var(--accent-light)', top: '78%', left: '58%', delay: '1.2s' },
        { label: 'Rift-powered', color: 'var(--accent-2-light)', top: '88%', left: '6%', delay: '0.6s' },
      ].map((pill) => (
        <div
          key={pill.label}
          style={{
            position: 'absolute',
            top: pill.top,
            left: pill.left,
            background: 'rgba(12,18,32,0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: '5px 13px',
            fontSize: 11,
            fontWeight: 700,
            color: pill.color,
            animation: `lcFloat 4.5s ${pill.delay} ease-in-out infinite`,
            whiteSpace: 'nowrap',
          }}
        >
          {pill.label}
        </div>
      ))}
    </div>
  );
}

export function LoginScreen({ onLogin, onGuest }: LoginScreenProps) {
  const [vis, setVis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setVis(true), 60);
  }, []);

  async function handleModriftLogin() {
    setLoading(true);
    setAuthError(null);
    try {
      const profile = await startAuth();
      onLogin(profile);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        opacity: vis ? 1 : 0,
        transition: 'opacity 0.7s var(--ease-out)',
      }}
    >
      {/* Left: auth panel */}
      <div
        style={{
          width: 456,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '52px 56px',
          position: 'relative',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '20%',
            width: 380,
            height: 380,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 65%)',
            transform: 'translate(-50%,-50%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 44 }}>
            <Logo size={26} />
          </div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              marginBottom: 14,
            }}
          >
            Welcome to Modrift
          </div>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.04,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            Your mods.
            <br />
            Your world.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: 40,
            }}
          >
            Install, manage and launch Rift mods — all from one place.
          </p>

          {loading ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 11,
                padding: '14px 22px',
                background: 'var(--surface)',
                border: '1px solid var(--border-solid)',
                borderRadius: 'var(--radius-btn)',
                color: 'var(--text-secondary)',
                fontSize: 14.5,
                fontWeight: 700,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="8" cy="8" r="6" stroke="var(--accent-light)" strokeWidth="2" strokeDasharray="25 13" />
              </svg>
              Waiting for Modrift login…
            </div>
          ) : (
            <AuthBtn
              icon={<Logo size={18} showWord={false} />}
              label="Continue with Modrift"
              primary
              onClick={handleModriftLogin}
            />
          )}
          {authError && (
            <p style={{ fontSize: 12, color: 'var(--err, #ef4444)', marginTop: 8, lineHeight: 1.5 }}>
              {authError}
            </p>
          )}
          <div style={{ height: 8 }} />
          <AuthBtn
            label={
              <span>
                Play as guest{' '}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                  (offline mode)
                </span>
              </span>
            }
            onClick={onGuest}
          />

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 26, lineHeight: 1.6 }}>
            No account yet?{' '}
            <a
              href="https://modrift.dev"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
            >
              Sign up at modrift.dev →
            </a>
          </p>
        </div>
      </div>

      {/* Right: showcase */}
      <AnimatedShowcase />
    </div>
  );
}
