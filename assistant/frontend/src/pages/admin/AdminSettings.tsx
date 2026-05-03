import { Monitor, Moon, ShieldCheck, Sun } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import { useTheme } from '../../lib/ThemeContext';
import { useAuth } from '../../lib/AuthContext';

type ThemeOption = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeOption; label: string; description: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', description: 'Interface lumineuse pour les journées de travail.', icon: Sun },
  { value: 'dark', label: 'Sombre', description: 'Interface sombre pour réduire la fatigue visuelle.', icon: Moon },
  { value: 'system', label: 'Système', description: "Suit la préférence de l'appareil.", icon: Monitor },
];

export default function AdminSettings() {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const stored = localStorage.getItem('assistant.theme');
  const activeOption: ThemeOption = stored === 'dark' || stored === 'light' ? stored : 'system';

  function selectTheme(value: ThemeOption) {
    if (value === 'system') {
      localStorage.removeItem('assistant.theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      return;
    }

    localStorage.setItem('assistant.theme', value);
    setTheme(value);
  }

  return (
    <>
      <TopBar title="Paramètres" subtitle="Préférences de l'espace Admin" />
      <main className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-5 space-y-4">
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-fluent bg-t-success-bg flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-t-success" />
              </div>
              <div>
                <h1 className="text-subtitle1 font-semibold text-t-fg1">Compte administrateur</h1>
                <p className="text-caption1 text-t-fg3 mt-1">{user?.email}</p>
                <p className="text-caption1 text-t-fg3 mt-1">
                  Rôle courant : <span className="font-semibold text-t-fg2">{user?.role || 'ADMIN'}</span>
                </p>
              </div>
            </div>
          </section>

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
            <h2 className="text-subtitle2 font-semibold text-t-fg1">Apparence</h2>
            <p className="text-caption1 text-t-fg3 mt-0.5">Choisissez le thème utilisé dans l'espace Admin.</p>

            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => selectTheme(option.value)}
                  className={`text-left border rounded-fluent px-4 py-4 transition-colors ${
                    activeOption === option.value
                      ? 'border-t-stroke-brand bg-t-bg-brand-selected'
                      : 'border-t-stroke3 bg-t-bg1 hover:bg-t-bg2'
                  }`}
                >
                  <option.icon className="w-5 h-5 text-t-fg-brand mb-3" />
                  <span className="block text-body1 font-semibold text-t-fg1">{option.label}</span>
                  <span className="block text-caption1 text-t-fg3 mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
