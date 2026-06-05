import React, { useState } from 'react';
import type { Instance, User } from '../../types';

const viewLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'var(--accent-light)',
};

interface ModsViewProps {
  instances: Instance[];
  showToast: (msg: string, type?: string) => void;
  user: User | null;
  onLogout: () => void;
  onSetInstances: React.Dispatch<React.SetStateAction<Instance[]>>;
}

export function ModsView({ instances }: ModsViewProps) {
  const [selId, setSelId] = useState<number | null>(instances[0]?.id ?? null);
  const sel = instances.find((i) => i.id === selId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={viewLabelStyle}>Installed</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginTop: 4,
          }}
        >
          Mods
        </h2>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Instance picker */}
        <div
          style={{
            width: 200,
            borderRight: '1px solid var(--border)',
            padding: '12px 10px',
            overflow: 'auto',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              padding: '4px 8px 10px',
            }}
          >
            Select instance
          </div>
          {instances.length === 0 && (
            <div style={{ padding: '8px', fontSize: 12, color: 'var(--text-muted)' }}>
              No instances yet.
            </div>
          )}
          {instances.map((inst) => (
            <button
              key={inst.id}
              onClick={() => setSelId(inst.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 9px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                background: selId === inst.id ? 'var(--accent-dim)' : 'transparent',
                color: selId === inst.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 2,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: inst.grad,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {inst.name}
              </span>
            </button>
          ))}
        </div>

        {/* Mod list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {!sel ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 12,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: 14 }}>
                {instances.length === 0
                  ? 'Create an instance first in the Instances tab.'
                  : 'Select an instance to view its mods.'}
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {sel.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
                Mod management is coming soon. Use the{' '}
                <strong style={{ color: 'var(--accent-light)' }}>Discover</strong> tab to browse
                available mods for the Rift loader.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
