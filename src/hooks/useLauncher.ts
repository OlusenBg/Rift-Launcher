import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface LaunchProgress {
  instance_id: string;
  stage: string;
  pct: number;
}

export interface InstanceStateEvent {
  instance_id: string;
  running: boolean;
}

export async function launchInstance(instanceId: string, version: string): Promise<void> {
  return invoke('launch_instance', { instanceId, version });
}

export async function stopInstance(instanceId: string): Promise<void> {
  return invoke('stop_instance', { instanceId });
}

export async function getRunningInstances(): Promise<string[]> {
  return invoke('get_running_instances');
}

export async function getMinecraftVersions(): Promise<string[]> {
  return invoke('get_minecraft_versions');
}

export function onLaunchProgress(cb: (p: LaunchProgress) => void): Promise<UnlistenFn> {
  return listen<LaunchProgress>('launch-progress', (e) => cb(e.payload));
}

export function onInstanceState(cb: (s: InstanceStateEvent) => void): Promise<UnlistenFn> {
  return listen<InstanceStateEvent>('instance-state', (e) => cb(e.payload));
}
