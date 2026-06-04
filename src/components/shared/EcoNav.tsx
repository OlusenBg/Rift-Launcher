import { useEffect } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icons';

interface NavLink {
  label: string;
  active?: boolean;
  onClick?: () => void;
  soon?: boolean;
}

interface EcoNavProps {
  sub?: string;
  links?: NavLink[];
  avatar?: string;
  onHome?: () => void;
  onGithub?: () => void;
  centered?: boolean;
}

function ensureEcoNavStyles() {
  if (document.getElementById('econav-styles')) return;
  const s = document.createElement('style');
  s.id = 'econav-styles';
  s.textContent = `
    .en { position: sticky; top: 0; z-index: 60; height: 56px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 22px; background: rgba(7,13,23,0.92); backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); border-bottom: 1px solid var(--border); }
    .en-left { display: flex; align-items: baseline; gap: 9px; cursor: pointer; flex-shrink: 0; }
    .en-sub { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
    .en-links { display: flex; align-items: center; gap: 4px; flex: 1; }
    .en-links.centered { justify-content: center; }
    .en-link { display: inline-flex; align-items: center; gap: 7px; padding: 7px 15px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; color: var(--text-secondary); background: none; border: none; white-space: nowrap; cursor: pointer; transition: color .15s, background .15s; }
    .en-link:hover { color: var(--text-primary); background: var(--surface); }
    .en-link.active { color: var(--accent-light); background: var(--accent-dim); }
    .en-soon { font-size: 8.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-muted); background: var(--surface-2); border: 1px solid var(--border); padding: 1px 6px; border-radius: 100px; }
    .en-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .en-gh { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-secondary); background: none; cursor: pointer; transition: border-color .15s, color .15s; }
    .en-gh:hover { border-color: var(--border-hover); color: var(--text-primary); }
    .en-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: grid; place-items: center; font-size: 13px; font-weight: 700; color: var(--accent-light); }
    @media (max-width: 640px) { .en-sub { display: none; } .en-links { gap: 0; } .en-link { padding: 7px 10px; font-size: 13px; } }
  `;
  document.head.appendChild(s);
}

export function EcoNav({ sub, links = [], avatar, onHome, onGithub, centered }: EcoNavProps) {
  useEffect(ensureEcoNavStyles, []);
  return (
    <header className="en">
      <div className="en-left" onClick={onHome}>
        <Logo size={26} />
        <span className="en-sub">{sub}</span>
      </div>
      <nav className={`en-links ${centered ? 'centered' : ''}`}>
        {links.map((l) => (
          <button key={l.label} className={`en-link ${l.active ? 'active' : ''}`} onClick={l.onClick}>
            {l.label}
            {l.soon && <span className="en-soon">Soon</span>}
          </button>
        ))}
      </nav>
      <div className="en-right">
        <button className="en-gh" onClick={onGithub || (() => {})} aria-label="GitHub">
          <Icon.github s={16} />
        </button>
        {avatar && <div className="en-avatar">{avatar}</div>}
      </div>
    </header>
  );
}
