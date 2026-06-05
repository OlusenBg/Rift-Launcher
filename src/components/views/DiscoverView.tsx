import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar, ModCard } from './shared';
import { fetchMods, fetchCategories } from '../../hooks/useModriftApi';
import type { Mod, Instance, User } from '../../types';

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
  const [tags, setTags] = useState<string[]>(['All']);
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCategories().then((cats) => {
      if (cats.length > 0) setTags(['All', ...cats]);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchMods({
        search: q || undefined,
        category: tag !== 'All' ? tag : undefined,
        limit: 48,
      });
      setMods(results as unknown as Mod[]);
    } catch (e) {
      setError('Could not reach modrift.dev — check your connection.');
    } finally {
      setLoading(false);
    }
  }, [q, tag]);

  useEffect(() => {
    const t = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  function handleAdd(mod: Mod) {
    const key = (mod as unknown as { slug?: string }).slug ?? String(mod.id);
    setAdded((prev) => ({ ...prev, [key]: true }));
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
          {tags.map((t) => (
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
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 14 }}>
            Loading mods…
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</div>
            <button
              onClick={load}
              style={{
                padding: '8px 20px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-btn)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : mods.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 14 }}>
            {q ? `No mods match "${q}"` : 'No mods available yet.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {mods.map((mod) => {
              const key = (mod as unknown as { slug?: string }).slug ?? String(mod.id);
              return (
                <ModCard key={key} mod={mod} onAdd={handleAdd} added={!!added[key]} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
