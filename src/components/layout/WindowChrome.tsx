import { WinDots } from '../shared/WinDots';

interface WindowChromeProps {
  title?: string;
}

export function WindowChrome({ title = 'Modrift Launcher' }: WindowChromeProps) {
  return (
    <div
      style={{
        height: 42,
        flexShrink: 0,
        background: 'rgba(7,13,23,0.98)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        userSelect: 'none',
      }}
    >
      <WinDots />
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </span>
      <div style={{ width: 54 }} />
    </div>
  );
}
