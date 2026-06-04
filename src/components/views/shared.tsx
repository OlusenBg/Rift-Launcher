import React, { useState } from 'react';
import { Icon, LIcon } from '../shared/Icons';
import type { Instance, Mod } from '../../types';

// ── Instance Card ─────────────────────────────────────────────────────────
interface InstanceCardProps {
  instance: Instance;
  onPlay: (instance: Instance) => void;
  onEdit?: (instance: Instance) => void;
  onDelete?: (id: number) => void;
}

export function InstanceCard({ instance, onPlay, onEdit, onDelete }: InstanceCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? 'var(--shadow-card)' : 'none',
        transition: 'transform 0.2s var(--ease-out), border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 124,
          position: 'relative',
          background: instance.grad,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              'linear-gradient(rgba(167,139,250,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.4) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: 9,
            right: 9,
            background: 'rgba(7,13,23,0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 10.5,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-light)',
          }}
        >
          {instance.version}
        </span>
        {instance.running && (
          <span
            style={{
              position: 'absolute',
              top: 9,
              left: 9,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: 100,
              padding: '2px 8px',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ok)',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--ok)',
                animation: 'lcPulse 1.5s ease-in-out infinite',
              }}
            />
            Running
          </span>
        )}
        {hov && (
          <div style={{ position: 'absolute', bottom: 9, right: 9, display: 'flex', gap: 5 }}>
            <button
              onClick={() => onEdit && onEdit(instance)}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(7,13,23,0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <LIcon.edit s={12} />
            </button>
            <button
              onClick={() => onDelete && onDelete(instance.id)}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(7,13,23,0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              <LIcon.trash s={12} />
            </button>
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>
          {instance.name}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{instance.mods} mods</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Played {instance.lastPlayed}</span>
        </div>
        <button
          onClick={() => onPlay(instance)}
          style={{
            width: '100%',
            padding: '9px 0',
            background: instance.running ? 'rgba(34,197,94,0.12)' : 'var(--gradient-primary)',
            border: instance.running ? '1px solid rgba(34,197,94,0.35)' : 'none',
            borderRadius: 'var(--radius-btn)',
            color: instance.running ? 'var(--ok)' : '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            boxShadow: instance.running ? 'none' : 'var(--glow-accent)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Icon.play s={11} />
          {instance.running ? 'Open console' : 'Play'}
        </button>
      </div>
    </div>
  );
}

// ── Mod Card ──────────────────────────────────────────────────────────────
interface ModCardProps {
  mod: Mod;
  onAdd: (mod: Mod) => void;
  added: boolean;
}

export function ModCard({ mod, onAdd, added }: ModCardProps) {
  const [hov, setHov] = useState(false);
  const initials = mod.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-card)',
        padding: '16px',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? 'var(--shadow-card)' : 'none',
        transition: 'all 0.2s var(--ease-out)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            flexShrink: 0,
            background: mod.color,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font)',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {mod.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>by {mod.author}</div>
        </div>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 6,
            padding: '2px 7px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {mod.tag}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {mod.version}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mod.downloads} downloads</span>
      </div>
      <button
        onClick={() => onAdd(mod)}
        style={{
          padding: '8px 0',
          background: added ? 'rgba(34,197,94,0.09)' : hov ? 'var(--gradient-primary)' : 'var(--surface-2)',
          border: added
            ? '1px solid rgba(34,197,94,0.35)'
            : `1px solid ${hov ? 'transparent' : 'var(--border)'}`,
          borderRadius: 'var(--radius-btn)',
          fontSize: 12.5,
          fontWeight: 600,
          color: added ? 'var(--ok)' : hov ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer',
          boxShadow: hov && !added ? 'var(--glow-accent)' : 'none',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {added ? (
          <>
            <Icon.check s={12} c="var(--ok)" /> Added
          </>
        ) : (
          <>
            <Icon.plus s={12} /> Add to instance
          </>
        )}
      </button>
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span
        style={{
          position: 'absolute',
          left: 13,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          display: 'flex',
        }}
      >
        <Icon.search s={14} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search…'}
        style={{
          width: '100%',
          padding: '9px 14px 9px 38px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-input)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font)',
          fontSize: 13.5,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width }: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(7,13,23,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: width || 480,
          maxWidth: '100%',
          maxHeight: '85vh',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-float)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 22,
              lineHeight: 1,
              padding: '1px 5px',
              borderRadius: 6,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────
interface ToggleProps {
  enabled: boolean;
}

export function Toggle({ enabled }: ToggleProps) {
  const [on, setOn] = useState(enabled);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 100,
        background: on ? 'var(--gradient-primary)' : 'var(--surface-2)',
        border: `1px solid ${on ? 'transparent' : 'var(--border)'}`,
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 'calc(100% - 17px)' : 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: on ? '#fff' : 'var(--text-muted)',
          transition: 'left 0.2s var(--ease-out)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

// ── Input style ───────────────────────────────────────────────────────────
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-input)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font)',
  fontSize: 14,
  outline: 'none',
};

// ── Labeled Field ─────────────────────────────────────────────────────────
interface LabeledFieldProps {
  label: string;
  children: React.ReactNode;
}

export function LabeledField({ label, children }: LabeledFieldProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
