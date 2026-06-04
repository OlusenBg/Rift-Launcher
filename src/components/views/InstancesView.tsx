import React, { useState } from 'react';
import { Icon } from '../shared/Icons';
import { InstanceCard, Modal, LabeledField, inputStyle } from './shared';
import type { Instance, User } from '../../types';

const MC_VERSIONS = ['1.21.1','1.21','1.20.6','1.20.4','1.20.1','1.19.4','1.19.2','1.18.2','1.16.5','1.12.2'];

const viewLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  color: 'var(--accent-light)',
};

interface InstancesViewProps {
  instances: Instance[];
  onSetInstances: React.Dispatch<React.SetStateAction<Instance[]>>;
  showToast: (msg: string, type?: string) => void;
  user: User | null;
  onLogout: () => void;
}

export function InstancesView({ instances, onSetInstances, showToast }: InstancesViewProps) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVer, setNewVer] = useState('1.21.1');
  const [creating, setCreating] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setTimeout(() => {
      const grads = [
        'linear-gradient(145deg,#1a0a3a,#2d1b69)',
        'linear-gradient(145deg,#0a1520,#1a3050)',
        'linear-gradient(145deg,#0e1028,#221048)',
        'linear-gradient(145deg,#251408,#3a2214)',
      ];
      onSetInstances((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newName.trim(),
          version: newVer,
          mods: 0,
          lastPlayed: 'Never',
          grad: grads[prev.length % grads.length],
          running: false,
        },
      ]);
      setShowNew(false);
      setNewName('');
      setCreating(false);
      showToast('Instance created', 'ok');
    }, 600);
  }

  function handleDelete(id: number) {
    onSetInstances((prev) => prev.filter((i) => i.id !== id));
    showToast('Instance deleted', 'accent');
  }

  function handlePlay(inst: Instance) {
    onSetInstances((prev) =>
      prev.map((i) => (i.id === inst.id ? { ...i, running: !i.running } : i))
    );
    showToast(inst.running ? 'Stopped instance' : 'Launching…', inst.running ? 'accent' : 'ok');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 28px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={viewLabelStyle}>Library</div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginTop: 4,
            }}
          >
            Instances
          </h2>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 18px',
            background: 'var(--gradient-primary)',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--glow-accent)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Icon.plus s={13} /> New instance
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
        {instances.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 14,
              color: 'var(--text-muted)',
            }}
          >
            <Icon.grid s={32} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>No instances yet</span>
            <span style={{ fontSize: 13 }}>Create your first instance to get started.</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {instances.map((inst) => (
              <InstanceCard
                key={inst.id}
                instance={inst}
                onPlay={handlePlay}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* New instance modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New instance">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <LabeledField label="Name">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Modpack"
              autoFocus
              style={inputStyle}
            />
          </LabeledField>
          <LabeledField label="Minecraft version">
            <select
              value={newVer}
              onChange={(e) => setNewVer(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}
            >
              {MC_VERSIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="Loader">
            <div
              style={{
                ...inputStyle,
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--ok)',
                  display: 'inline-block',
                }}
              />
              Rift v1.4.2{' '}
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-light)',
                }}
              >
                auto
              </span>
            </div>
          </LabeledField>
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            style={{
              marginTop: 6,
              padding: '12px',
              background: 'var(--gradient-primary)',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--glow-accent)',
              opacity: !newName.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            {creating ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'lcSpin 0.7s linear infinite',
                  }}
                />{' '}
                Creating…
              </>
            ) : (
              <>
                <Icon.plus s={13} /> Create instance
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
