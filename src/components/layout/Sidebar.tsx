import { Logo } from '../shared/Logo';
import { Icon, LIcon } from '../shared/Icons';
import type { User } from '../../types';

interface SidebarProps {
  section: string;
  onNavigate: (section: string) => void;
  user: User | null;
  compact?: boolean;
}

export function Sidebar({ section, onNavigate, user, compact }: SidebarProps) {
  const items = [
    { id: 'instances', label: 'Instances', icon: <Icon.grid s={16} /> },
    { id: 'mods',      label: 'Mods',      icon: <Icon.bolt s={16} /> },
    { id: 'modpacks',  label: 'Modpacks',  icon: <Icon.layers s={16} /> },
    { id: 'discover',  label: 'Discover',  icon: <Icon.globe s={16} /> },
    { id: 'settings',  label: 'Settings',  icon: <LIcon.settings s={16} /> },
  ];
  const w = compact ? 58 : 216;

  return (
    <aside
      style={{
        width: w,
        flexShrink: 0,
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        transition: 'width 0.25s var(--ease-out)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: compact ? '4px 9px 18px' : '4px 8px 22px', overflow: 'hidden' }}>
        <Logo size={21} showWord={!compact} />
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map(({ id, label, icon }) => {
          const active = section === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={compact ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: compact ? '9px 11px' : '9px 12px',
                justifyContent: compact ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {icon}
              {!compact && label}
            </button>
          );
        })}
      </nav>
      {user && !compact && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px 8px',
            borderTop: '1px solid var(--border)',
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              flexShrink: 0,
              background: user.type === 'guest' ? 'var(--surface-2)' : 'var(--accent-dim)',
              border: `1px solid ${user.type === 'guest' ? 'var(--border)' : 'rgba(124,58,237,0.4)'}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 12.5,
              fontWeight: 700,
              color: user.type === 'guest' ? 'var(--text-muted)' : 'var(--accent-light)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Rift Launcher
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
