import React, { useState } from 'react';
import { LIcon } from '../shared/Icons';
import { Toggle } from './shared';
import type { User } from '../../types';

const viewLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'var(--accent-light)',
};

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
}

function SettingsSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 28 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent-light)',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsView({ user, onLogout }: SettingsViewProps) {
  const [memory, setMemory] = useState(4);
  const [autoUpdate, setAutoUpdate] = useState(() => {
    try { return localStorage.getItem('lc_autoUpdate') !== 'false'; } catch { return true; }
  });
  const [closeToTray, setCloseToTray] = useState(() => {
    try { return localStorage.getItem('lc_closeToTray') === 'true'; } catch { return false; }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={viewLabelStyle}>Preferences</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginTop: 4,
          }}
        >
          Settings
        </h2>
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          maxWidth: 600,
        }}
      >
        <SettingsSection title="Account">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: user?.type === 'guest' ? 'var(--surface-2)' : 'var(--accent-dim)',
                border: `1px solid ${user?.type === 'guest' ? 'var(--border)' : 'rgba(124,58,237,0.4)'}`,
                display: 'grid',
                placeItems: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: user?.type === 'guest' ? 'var(--text-muted)' : 'var(--accent-light)',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name || 'Guest'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {user?.type === 'guest' ? 'Offline mode' : 'Microsoft account'}
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid var(--border-solid)',
                borderRadius: 'var(--radius-btn)',
                color: 'var(--text-secondary)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-solid)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Sign out
            </button>
          </div>
        </SettingsSection>

        <SettingsSection title="Performance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <LIcon.memory s={14} />
                  RAM allocation
                </label>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-light)',
                  }}
                >
                  {memory} GB
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={memory}
                onChange={(e) => setMemory(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>1 GB</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>16 GB</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <LIcon.folder s={14} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Java home
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    marginTop: 1,
                  }}
                >
                  Auto-detected
                </div>
              </div>
              <button
                style={{
                  padding: '5px 12px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Browse
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Launcher">
          <SettingsRow label="Auto-update mods" sub="Keep all mods updated automatically">
            <Toggle enabled={autoUpdate} onChange={(v) => { setAutoUpdate(v); try { localStorage.setItem('lc_autoUpdate', String(v)); } catch {} }} />
          </SettingsRow>
          <div style={{ height: 8 }} />
          <SettingsRow label="Close to tray" sub="Keep the launcher running in background">
            <Toggle enabled={closeToTray} onChange={(v) => { setCloseToTray(v); try { localStorage.setItem('lc_closeToTray', String(v)); } catch {} }} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="About" last>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Launcher', __APP_VERSION__],
              ['Platform', navigator.platform || 'Unknown'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {k}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
