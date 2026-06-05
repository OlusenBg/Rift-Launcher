import { useState, useEffect } from 'react';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { WindowChrome } from './components/layout/WindowChrome';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { InstancesView } from './components/views/InstancesView';
import { ModsView } from './components/views/ModsView';
import { ModpacksView } from './components/views/ModpacksView';
import { DiscoverView } from './components/views/DiscoverView';
import { SettingsView } from './components/views/SettingsView';
import { TweaksPanel, TweakSection, TweakToggle, TweakColor, useTweaks } from './tweaks/TweaksPanel';
import type { User, Instance, ToastState } from './types';
import { getSession, logout as tauriLogout, type MinecraftProfile } from './hooks/useAuth';
import { setApiKey } from './hooks/useModriftApi';

// ── Color helpers ─────────────────────────────────────────────────────────────

/** Only accept 3 or 6-digit hex colors — rejects any injection attempt. */
function isSafeHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v);
}

function dimify(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.15)`;
}

const TWEAK_DEFAULTS = {
  sidebarCompact: false,
  accentColor: '#7C3AED',
};

// ── Main App ──────────────────────────────────────────────────────────────────
function MainApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [section, setSection] = useState('instances');
  const [instances, setInstances] = useState<Instance[]>(() => {
    try {
      const s = localStorage.getItem('lc_instances');
      if (!s) return [];
      const parsed: unknown[] = JSON.parse(s);
      // Migration: drop any instances that look like old demo data
      // (they have non-zero mods count but no user-created flag)
      return parsed.filter(
        (i): i is Instance =>
          typeof i === 'object' && i !== null &&
          'id' in i && 'name' in i && 'version' in i && 'grad' in i
      );
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState<ToastState>({ msg: '', type: 'ok', vis: false });

  // Persist instances
  useEffect(() => {
    try {
      localStorage.setItem('lc_instances', JSON.stringify(instances));
    } catch {}
  }, [instances]);

  // Toast helper
  function showToast(msg: string, type = 'ok') {
    setToast({ msg, type, vis: true });
    setTimeout(() => setToast((p) => ({ ...p, vis: false })), 2500);
  }

  const viewProps = {
    instances,
    onSetInstances: setInstances,
    showToast,
    user,
    onLogout,
  };

  return (
    <>
      {t.accentColor !== '#7C3AED' && isSafeHex(t.accentColor) && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--accent:${t.accentColor};--accent-dim:${dimify(t.accentColor)};--glow-accent:0 0 24px ${t.accentColor}66;}`,
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <WindowChrome />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            section={section}
            onNavigate={setSection}
            user={user}
            compact={t.sidebarCompact}
          />
          <main
            style={{
              flex: 1,
              overflow: 'hidden',
              background: 'var(--surface)',
              animation: 'lcReveal 0.4s var(--ease-out)',
            }}
          >
            {section === 'instances' && <InstancesView {...viewProps} />}
            {section === 'mods' && <ModsView {...viewProps} />}
            {section === 'modpacks' && <ModpacksView {...viewProps} />}
            {section === 'discover' && <DiscoverView {...viewProps} />}
            {section === 'settings' && <SettingsView user={user} onLogout={onLogout} />}
          </main>
        </div>
      </div>

      <Toast message={toast.msg} type={toast.type} visible={toast.vis} />

      <TweaksPanel>
        <TweakSection label="Sidebar" />
        <TweakToggle
          label="Compact sidebar"
          value={t.sidebarCompact}
          onChange={(v) => setTweak('sidebarCompact', v)}
        />
        <TweakSection label="Accent" />
        <TweakColor
          label="Accent color"
          value={t.accentColor}
          options={['#7C3AED', '#2563EB', '#0891B2', '#059669']}
          onChange={(v) => setTweak('accentColor', v)}
        />
      </TweaksPanel>
    </>
  );
}

// ── Root App — screen router ───────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'app'>('splash');
  const [user, setUser] = useState<User | null>(null);

  // Persist session — check Tauri session first, fall back to localStorage
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (session) {
          setApiKey(session.launcher_api_key);
          const u: User = { name: session.minecraft_username, type: 'microsoft' };
          setUser(u);
          setScreen('app');
          return;
        }
      } catch {
        // Tauri not available (e.g. browser dev) — fall through to localStorage
      }
      try {
        const saved = localStorage.getItem('lc_user');
        if (saved) {
          setUser(JSON.parse(saved));
          setScreen('app');
        }
      } catch {}
    })();
  }, []);

  function handleLogin(profile: MinecraftProfile) {
    setApiKey(profile.launcher_api_key);
    const u: User = { name: profile.username, type: 'microsoft' };
    setUser(u);
    try {
      localStorage.setItem('lc_user', JSON.stringify(u));
    } catch {}
    setScreen('app');
  }

  function handleGuest() {
    setApiKey(null); // ensure no stale auth key from a previous login session
    const u: User = { name: 'Guest', type: 'guest' };
    setUser(u);
    try {
      localStorage.setItem('lc_user', JSON.stringify(u));
    } catch {}
    setScreen('app');
  }

  async function handleLogout() {
    setApiKey(null);
    setUser(null);
    try {
      await tauriLogout();
    } catch {
      // Tauri not available
    }
    try {
      localStorage.removeItem('lc_user');
    } catch {}
    setScreen('login');
  }

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {screen === 'splash' && <SplashScreen onComplete={() => setScreen('login')} />}

      {screen === 'login' && (
        <div style={{ height: '100%' }}>
          <LoginScreen onLogin={handleLogin} onGuest={handleGuest} />
        </div>
      )}

      {screen === 'app' && user && (
        <div style={{ height: '100%' }}>
          <MainApp user={user} onLogout={handleLogout} />
        </div>
      )}
    </div>
  );
}
