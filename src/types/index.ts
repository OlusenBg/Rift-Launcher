export interface User {
  name: string;
  type: 'microsoft' | 'guest';
}

export interface Instance {
  id: number;
  name: string;
  version: string;
  mods: number;
  lastPlayed: string;
  grad: string;
  running: boolean;
}

export interface Mod {
  id: number;
  name: string;
  author: string;
  downloads: string;
  version: string;
  tag: string;
  color: string;
}

export interface Modpack {
  id: number;
  name: string;
  author: string;
  mods: number;
  version: string;
  tag: string;
  color: string;
  desc: string;
}

export interface ToastState {
  msg: string;
  type: string;
  vis: boolean;
}

export interface TweakValues {
  sidebarCompact: boolean;
  accentColor: string;
}
