import React, { useId } from 'react';

interface LogoProps {
  size?: number;
  showWord?: boolean;
  color?: string;
}

export function Logo({ size = 30, showWord = true, color = '#ECEDF0' }: LogoProps) {
  const rawId = useId().replace(/:/g, '');
  // Voxel M — 5×5 Minecraft-block grid; center block is the glowing cyan rift.
  const grid = [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 2, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ];
  const cell = 13, step = 15, ox = 7, oy = 7;
  const rects: React.ReactNode[] = [];
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) return;
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={ox + c * step}
          y={oy + r * step}
          width={cell}
          height={cell}
          rx="2.5"
          fill={v === 2 ? '#67E8F9' : `url(#${rawId}g)`}
          filter={v === 2 ? `url(#${rawId}gl)` : undefined}
        />
      );
    })
  );

  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      style={{ display: 'flex', alignItems: 'center', gap: size * 0.34, textDecoration: 'none' }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${rawId}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <filter id={`${rawId}gl`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {rects}
      </svg>
      {showWord && (
        <span
          style={{
            fontSize: size * 0.6,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color,
            lineHeight: 1,
          }}
        >
          Modrift
        </span>
      )}
    </a>
  );
}
