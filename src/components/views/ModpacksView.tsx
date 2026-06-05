import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../shared/Icons';
import { SearchBar } from './shared';
import { fetchModpacks, fetchModpackCategories, type ModpackCard } from '../../hooks/useModriftApi';
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

function PackCard({
  pack,
  onInstall,
  installed,
}: {
  pack: ModpackCard;
  onInstall: (pack: ModpackCard) => void;
  installed: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: `1px solid ${hov ? 'rgba(124,58,237,0.45)' : 'var(--border)'}`,
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? 'var(--shadow-card)' : 'none',
        transition: 'all 0.2s var(--ease-out)',
      }}
    >
      <div
        style={{
          height: 80,
          background: pack.color,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 16px 12px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              'linear-gradient(rgba(167,139,250,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.4) 1px,transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 5,
            padding: '2px 7px',
            position: 'relative',
          }}
        >
          {pack.tag}
        </span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
          {pack.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>
          by {pack.author}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
          {pack.desc}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{pack.mods} mods</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {pack.version}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{pack.downloads} downloads</span>
        </div>
        <button
          onClick={() => onInstall(pack)}
          style={{
            width: '100%',
            padding: '9px 0',
            background: installed ? 'rgba(34,197,94,0.09)' : hov ? 'var(--gradient-primary)' : 'var(--surface-2)',
            border: installed
              ? '1px solid rgba(34,197,94,0.35)'
              : `1px solid ${hov ? 'transparent' : 'var(--border)'}`,
            borderRadius: 'var(--radius-btn)',
            fontSize: 12.5,
            fontWeight: 700,
            color: installed ? 'var(--ok)' : hov ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: hov && !installed ? 'var(--glow-accent)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {installed ? (
            <>
              <Icon.check s={12} c="var(--ok)" /> Queued
            </>
          ) : (
            <>
              <Icon.download s={12} /> Install
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ModpacksView({ showToast }: ModpacksViewProps) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('All');
  const [tags, setTags] = useState<string[]>(['All']);
  const [packs, setPacks] = useState<ModpackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchModpackCategories().then((cats) => {
      if (cats.length > 0) setTags(['All', ...cats]);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchModpacks({
        search: q || undefined,
        category: tag !== 'All' ? tag : undefined,
        limit: 48,
      });
      setPacks(results);
    } catch {
      setError('Could not reach modrift.dev — check your connection.');
    } finally {
      setLoading(false);
    }
  }, [q, tag]);

  useEffect(() => {
    const t = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  function handleInstall(pack: ModpackCard) {
    setInstalled((prev) => ({ ...prev, [pack.id]: true }));
    showToast(`${pack.name} queued for install`, 'ok');
  }

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
            marginBottom: 16,
          }}
        >
          Modpacks
        </h2>
        <SearchBar value={q} onChange={setQ} placeholder="Search modpacks…" />
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

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 14 }}>
            Loading modpacks…
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
        ) : packs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 14,
              paddingBottom: 40,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              📦
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {q ? `No modpacks match "${q}"` : 'No modpacks yet'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320 }}>
              {q
                ? 'Try a different search term.'
                : 'Modpacks for the Rift loader are coming soon. Check back later.'}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {packs.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                onInstall={handleInstall}
                installed={!!installed[pack.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
