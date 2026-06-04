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

// ── Color helpers ─────────────────────────────────────────────────────────────
function dimify(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.15)`;
}

// ── Default instances data ────────────────────────────────────────────────────
const DEFAULT_INSTANCES: Instance[] = [
  { id: 1, name: 'Survival Overhaul',      version: '1.21.1', mods: 47, lastPlayed: '2 hours ago',  grad: 'linear-gradient(145deg, #1a0a3a 0%, #2d1b69 100%)', running: false },
  { id: 2, name: 'Tech Mods Pack',          version: '1.20.4', mods: 82, lastPlayed: 'Yesterday',     grad: 'linear-gradient(145deg, #0a1520 0%, #1a3050 100%)', running: true  },
  { id: 3, name: "Create: Steam 'n' Rails", version: '1.20.1', mods: 35, lastPlayed: '3 days ago',   grad: 'linear-gradient(145deg, #251408 0%, #3a2214 100%)', running: false },
  { id: 4, name: 'Magic & Mystery',         version: '1.19.4', mods: 61, lastPlayed: 'Last week',     grad: 'linear-gradient(145deg, #0e1028 0%, #221048 100%)', running: false },
];

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
      return s ? JSON.parse(s) : DEFAULT_INSTANCES;
    } catch {
      return DEFAULT_INSTANCES;
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
      {t.accentColor !== '#7C3AED' && (
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
    const u: User = { name: profile.username, type: 'microsoft' };
    setUser(u);
    try {
      localStorage.setItem('lc_user', JSON.stringify(u));
    } catch {}
    setScreen('app');
  }

  function handleGuest() {
    const u: User = { name: 'Guest', type: 'guest' };
    setUser(u);
    try {
      localStorage.setItem('lc_user', JSON.stringify(u));
    } catch {}
    setScreen('app');
  }

  async function handleLogout() {
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
