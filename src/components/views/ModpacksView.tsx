import React from 'react';
import type { Instance, User } from '../../types';

const viewLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'var(--accent-light)',
};

interface ModpacksViewProps {
  instances: Instance[];
  showToast: (msg: string, type?: string) => void;
  user: User | null;
  onLogout: () => void;
  onSetInstances: React.Dispatch<React.SetStateAction<Instance[]>>;
}

export function ModpacksView(_props: ModpacksViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={viewLabelStyle}>From modrift.dev</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginTop: 4,
          }}
        >
          Modpacks
        </h2>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 40,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'var(--accent-dim)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          📦
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Modpacks coming soon
        </div>
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            textAlign: 'center',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Modpacks will be available once the modrift.dev modpack library launches.
          Stay tuned for curated packs built for the Rift loader.
        </div>
        <a
          href="https://modrift.dev"
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 8,
            padding: '10px 24px',
            background: 'var(--gradient-primary)',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--glow-accent)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Visit modrift.dev
        </a>
      </div>
    </div>
  );
}
