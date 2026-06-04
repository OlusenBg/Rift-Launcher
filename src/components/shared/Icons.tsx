interface IconProps {
  s?: number;
  c?: string;
  open?: boolean;
}

// Thin stroke, rounded caps, currentColor icons
export const Icon = {
  check: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={p?.c || '#22C55E'} strokeWidth="1.2" />
      <path d="M5 8l2.5 2.5L11 5" stroke={p?.c || '#22C55E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  alert: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={p?.c || '#F87171'} strokeWidth="1.2" />
      <path d="M8 5v3M8 10.5h.01" stroke={p?.c || '#F87171'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  arrow: (p?: IconProps) => (
    <svg width={p?.s || 14} height={p?.s || 14} viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: (p?: IconProps) => (
    <svg width={p?.s || 13} height={p?.s || 13} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6.5 1.5v7M4 6l2.5 2.5L9 6M1.5 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (p?: IconProps) => (
    <svg width={p?.s || 18} height={p?.s || 18} viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  send: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 16 16" fill="none">
      <path d="M14 2L2 7.5 7 8.5 8.5 14 14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  grid: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  code: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  layers: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bolt: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  shield: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  globe: (p?: IconProps) => (
    <svg width={p?.s || 22} height={p?.s || 22} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  github: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  chevron: (p?: IconProps) => (
    <svg
      width={p?.s || 14}
      height={p?.s || 14}
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: p?.open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (p?: IconProps) => (
    <svg width={p?.s || 15} height={p?.s || 15} viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  file: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 16 16" fill="none">
      <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  play: (p?: IconProps) => (
    <svg width={p?.s || 14} height={p?.s || 14} viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 2l9 5-9 5V2z" />
    </svg>
  ),
};

// Extra launcher icons
export const LIcon = {
  settings: (p?: IconProps) => (
    <svg width={p?.s || 20} height={p?.s || 20} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  ),
  trash: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  folder: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  cpu: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="none">
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  ms: () => (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f35325" />
      <rect x="11" y="1" width="9" height="9" fill="#81bc06" />
      <rect x="1" y="11" width="9" height="9" fill="#05a6f0" />
      <rect x="11" y="11" width="9" height="9" fill="#ffba08" />
    </svg>
  ),
  memory: (p?: IconProps) => (
    <svg width={p?.s || 16} height={p?.s || 16} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6V4M9 6V4M12 6V4M15 6V4M18 6V4M6 20v-2M9 20v-2M12 20v-2M15 20v-2M18 20v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="5" y="9" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10.5" y="9" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="16" y="9" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
};
