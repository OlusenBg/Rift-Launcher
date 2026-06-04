import { useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface WindowChromeProps {
  title?: string;
}

export function WindowChrome({ title = 'Modrift Launcher' }: WindowChromeProps) {
  const [hov, setHov] = useState(false);
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      style={{
        height: 42,
        flexShrink: 0,
        background: 'rgba(7,13,23,0.98)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        userSelect: 'none',
      }}
    >
      {/* Traffic lights */}
      <div
        style={{ display: 'flex', gap: 6, width: 54, flexShrink: 0 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {([
          { color: '#FF5F57', label: '×', action: () => appWindow.close() },
          { color: '#FEBC2E', label: '−', action: () => appWindow.minimize() },
          { color: '#28C840', label: '+', action: () => appWindow.toggleMaximize() },
        ] as const).map(({ color, label, action }) => (
          <button
            key={color}
            onClick={action}
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: color,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 7,
              fontWeight: 900,
              color: 'rgba(0,0,0,0.6)',
              lineHeight: 1,
            }}
          >
            {hov ? label : null}
          </button>
        ))}
      </div>

      {/* Center title */}
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.02em',
          pointerEvents: 'none',
        }}
      >
        {title}
      </span>

      {/* Right spacer (same width as left for centering) */}
      <div style={{ width: 54, flexShrink: 0 }} />
    </div>
  );
}
