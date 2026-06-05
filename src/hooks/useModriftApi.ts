const API_BASE = 'https://modrift.dev/api';

export interface ApiMod {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  thumbnail_url: string | null;
  version: string;
  tags: string[];
  category: string;
  download_count: number;
  followers_count: number;
  featured: boolean;
  creators: Array<{ name: string; role: string }>;
}

let _apiKey: string | null = null;

export function setApiKey(key: string | null) {
  _apiKey = key;
}

function headers(): HeadersInit {
  return _apiKey ? { Authorization: `Bearer ${_apiKey}` } : {};
}

function fmtDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const GRAD_PALETTE = [
  'linear-gradient(135deg,#1a0a3a,#2d1b69)',
  'linear-gradient(135deg,#0a1520,#1a3050)',
  'linear-gradient(135deg,#251408,#3a2214)',
  'linear-gradient(135deg,#0a1508,#183020)',
  'linear-gradient(135deg,#1a0826,#320f48)',
  'linear-gradient(135deg,#081520,#102840)',
  'linear-gradient(135deg,#180a0a,#301510)',
  'linear-gradient(135deg,#0e0818,#1c1030)',
];

export function modToCard(m: ApiMod) {
  const hash = [...m.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    id: m.id,
    name: m.name,
    author: m.creators[0]?.name ?? 'Unknown',
    downloads: fmtDownloads(m.download_count),
    version: m.version,
    tag: m.category || m.tags[0] || 'Mod',
    color: GRAD_PALETTE[hash % GRAD_PALETTE.length],
    short_description: m.short_description,
    slug: m.slug,
  };
}

export async function fetchMods(params?: {
  search?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
}): Promise<ReturnType<typeof modToCard>[]> {
  const url = new URL(`${API_BASE}/mods`);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.category && params.category !== 'All') url.searchParams.set('category', params.category);
  if (params?.featured) url.searchParams.set('featured', 'true');
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const list: ApiMod[] = Array.isArray(data) ? data : (data.mods ?? []);
  return list.map(modToCard);
}

export async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/mods/categories`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
