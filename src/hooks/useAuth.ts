import { invoke } from '@tauri-apps/api/core';

export interface SessionInfo {
  minecraft_uuid: string;
  minecraft_username: string;
  launcher_api_key: string;
}

export interface MinecraftProfile {
  uuid: string;
  username: string;
  launcher_api_key: string;
}

export async function startAuth(): Promise<MinecraftProfile> {
  return invoke('start_auth');
}

export async function getSession(): Promise<SessionInfo | null> {
  return invoke('get_session');
}

export async function logout(): Promise<void> {
  return invoke('logout');
}

export async function refreshMinecraftToken(): Promise<void> {
  return invoke('refresh_minecraft_token');
}
