export function WinDots() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map((c) => (
        <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
      ))}
    </div>
  );
}
