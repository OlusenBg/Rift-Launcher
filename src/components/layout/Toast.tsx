import { Icon } from '../shared/Icons';

interface ToastProps {
  message: string;
  type: string;
  visible: boolean;
}

export function Toast({ message, type, visible }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 72}px)`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s var(--ease-out)',
        zIndex: 999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '11px 20px',
        background: 'var(--surface)',
        border: `1px solid ${type === 'ok' ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.4)'}`,
        borderRadius: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      {type === 'ok' ? <Icon.check s={13} c="var(--ok)" /> : <Icon.bolt s={13} />}
      {message}
    </div>
  );
}
