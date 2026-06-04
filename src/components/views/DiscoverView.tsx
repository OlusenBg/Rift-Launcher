import React, { useState } from 'react';
import { SearchBar, ModCard } from './shared';
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

const MOD_TAGS = ['All', 'Technology', 'Magic', 'Adventure', 'World Gen', 'Utility', 'Library'];

const viewLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'var(--accent-light)',
};

interface DiscoverViewProps {
  instances: Instance[];
  showToast: (msg: string, type?: string) => void;
  user: User | null;
  onLogout: () => void;
  onSetInstances: React.Dispatch<React.SetStateAction<Instance[]>>;
}

export function DiscoverView({ showToast }: DiscoverViewProps) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('All');
  const [added, setAdded] = useState<Record<number, boolean>>({});

  const filtered = DISCOVER_MODS.filter(
    (m) =>
      (tag === 'All' || m.tag === tag) &&
      (!q ||
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.author.toLowerCase().includes(q.toLowerCase()))
  );

  function handleAdd(mod: (typeof DISCOVER_MODS)[0]) {
    setAdded((prev) => ({ ...prev, [mod.id]: true }));
    showToast(`${mod.name} added`, 'ok');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={viewLabelStyle}>Rift Mod Library</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          Discover
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search mods, authors…" />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {MOD_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                padding: '5px 13px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${tag === t ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                background: tag === t ? 'var(--accent-dim)' : 'transparent',
                color: tag === t ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {filtered.length === 0 ? (
          <div
            style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 14 }}
          >
            No mods match &ldquo;{q}&rdquo;
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {filtered.map((mod) => (
              <ModCard key={mod.id} mod={mod} onAdd={handleAdd} added={!!added[mod.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
