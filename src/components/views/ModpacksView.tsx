import React, { useState } from 'react';
import { Icon } from '../shared/Icons';
import type { Instance, User } from '../../types';

const FEATURED_MODPACKS = [
  { id: 1, name: 'RLCraft',               author: 'Shivaxi',       mods: 120, version: '1.12.2', tag: 'Survival',     color: 'linear-gradient(135deg,#1a0808,#401010)', desc: 'The hardest modpack ever made.' },
  { id: 2, name: 'All the Mods 9',        author: 'ATM Team',      mods: 380, version: '1.20.1', tag: 'Kitchen Sink', color: 'linear-gradient(135deg,#081528,#103050)', desc: 'Hundreds of mods, one modpack.' },
  { id: 3, name: 'Vault Hunters',         author: 'iskallia',      mods: 95,  version: '1.18.2', tag: 'RPG',          color: 'linear-gradient(135deg,#1a1208,#402800)', desc: 'Hunt vaults, earn loot, grow your build.' },
  { id: 4, name: 'Create: Above and Beyond', author: 'Simibubi Team', mods: 70, version: '1.16.5', tag: 'Technology', color: 'linear-gradient(135deg,#200a08,#3a1810)', desc: 'Create-centric progression modpack.' },
  { id: 5, name: 'Stoneblock 3',          author: 'FTB',           mods: 186, version: '1.19.2', tag: 'Skyblock',     color: 'linear-gradient(135deg,#0a0a18,#181828)', desc: 'Mine through stone from the very start.' },
  { id: 6, name: 'Enigmatica 9',          author: 'NillerMedDild', mods: 298, version: '1.20.1', tag: 'Expert',       color: 'linear-gradient(135deg,#0a1808,#182810)', desc: 'Expert-mode progression with 290+ mods.' },
];

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

interface PackCardProps {
  pack: (typeof FEATURED_MODPACKS)[0];
  onInstall: (pack: (typeof FEATURED_MODPACKS)[0]) => void;
  installed: boolean;
}

function PackCard({ pack, onInstall, installed }: PackCardProps) {
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
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {pack.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{pack.desc}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{pack.mods} mods</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {pack.version}
          </span>
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
  const [installed, setInstalled] = useState<Record<number, boolean>>({});

  function handleInstall(pack: (typeof FEATURED_MODPACKS)[0]) {
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
        <div style={viewLabelStyle}>From mods.modrift.dev</div>
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
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {FEATURED_MODPACKS.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              onInstall={handleInstall}
              installed={!!installed[pack.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
