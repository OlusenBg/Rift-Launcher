import React, { useState } from 'react';
import { Toggle } from './shared';
import type { Instance, User } from '../../types';

const DISCOVER_MODS = [
  { id: 1,  name: 'Create',                 author: 'Simibubi',     downloads: '12.4M', version: '0.5.1f',      tag: 'Technology', color: 'linear-gradient(135deg,#251408,#3a2214)' },
  { id: 2,  name: 'Twilight Forest',        author: 'Benimatic',    downloads: '8.9M',  version: '4.3.2145',    tag: 'Adventure',  color: 'linear-gradient(135deg,#0a1508,#1a3012)' },
  { id: 3,  name: 'Botania',                author: 'Vazkii',       downloads: '6.2M',  version: '1.21-446',    tag: 'Magic',      color: 'linear-gradient(135deg,#1a0826,#320f48)' },
  { id: 4,  name: 'Applied Energistics 2',  author: 'AlgorithmX2',  downloads: '5.8M',  version: '15.2.0',      tag: 'Technology', color: 'linear-gradient(135deg,#081520,#1a2a40)' },
  { id: 5,  name: "Biomes O' Plenty",       author: 'Glitchfiend',  downloads: '9.1M',  version: '21.0.0.8',    tag: 'World Gen',  color: 'linear-gradient(135deg,#0a1508,#183020)' },
  { id: 6,  name: 'Patchouli',              author: 'Vazkii',       downloads: '4.3M',  version: '1.21-87',     tag: 'Library',    color: 'linear-gradient(135deg,#181408,#2a2412)' },
  { id: 7,  name: 'Immersive Engineering',  author: 'BluSunrize',   downloads: '7.1M',  version: '10.1.0',      tag: 'Technology', color: 'linear-gradient(135deg,#180a0a,#301510)' },
  { id: 8,  name: 'Mekanism',               author: 'bradyaidanc',  downloads: '5.4M',  version: '10.4.6',      tag: 'Technology', color: 'linear-gradient(135deg,#081520,#102840)' },
  { id: 9,  name: 'Origins',                author: 'Apace100',     downloads: '4.8M',  version: '1.11.0',      tag: 'Adventure',  color: 'linear-gradient(135deg,#14081a,#26103a)' },
  { id: 10, name: "Farmer's Delight",       author: 'vectorwing',   downloads: '6.7M',  version: '1.4.3',       tag: 'Utility',    color: 'linear-gradient(135deg,#1a1008,#302018)' },
  { id: 11, name: 'Just Enough Items',      author: 'mezz',         downloads: '14.1M', version: '19.21.0.243', tag: 'Utility',    color: 'linear-gradient(135deg,#08101a,#182030)' },
  { id: 12, name: 'Waystones',              author: 'BlayTheNinth', downloads: '8.2M',  version: '14.1.3',      tag: 'Utility',    color: 'linear-gradient(135deg,#0e0818,#1c1030)' },
];

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
  const [selId, setSelId] = useState<number | null>(instances[0]?.id || null);
  const sel = instances.find((i) => i.id === selId);
  const fakeMods = sel
    ? Array.from({ length: sel.mods || 4 }, (_, i) => ({
        id: i,
        name: DISCOVER_MODS[i % DISCOVER_MODS.length].name,
        version: DISCOVER_MODS[i % DISCOVER_MODS.length].version,
        enabled: i % 7 !== 4,
      }))
    : [];

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
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0' }}>
              Select an instance.
            </div>
          ) : fakeMods.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0' }}>
              No mods installed.
            </div>
          ) : (
            fakeMods.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '11px 14px',
                  marginBottom: 6,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: DISCOVER_MODS[m.id % DISCOVER_MODS.length].color,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font)',
                  }}
                >
                  {m.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {m.version}
                  </div>
                </div>
                <Toggle enabled={m.enabled} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
