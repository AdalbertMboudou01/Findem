import { Moon, Sun, Monitor } from 'lucide-react';
import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useTheme } from '../lib/ThemeContext';
import { bootstrapTestCompany } from '../lib/domainApi';

type ThemeOption = 'light' | 'dark' | 'system';

const options: { value: ThemeOption; label: string; desc: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', desc: 'Interface lumineuse', icon: Sun },
  { value: 'dark', label: 'Sombre', desc: 'Interface sombre, repose les yeux', icon: Moon },
  { value: 'system', label: 'Systeme', desc: 'Suit les preferences de votre appareil', icon: Monitor },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem('assistant.theme');
  const activeOption: ThemeOption = stored === 'dark' || stored === 'light' ? stored : 'system';

  function handleSelect(value: ThemeOption) {
    if (value === 'system') {
      localStorage.removeItem('assistant.theme');
      setTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setTheme(value);
    }
  }

  async function handleBootstrapTestCompany() {
    try {
      setBootstrapLoading(true);
      setBootstrapError(null);
      setBootstrapMessage(null);

      const result = await bootstrapTestCompany();
      const companyLabel = result.companyName ? ` (${result.companyName})` : '';
      setBootstrapMessage(
        result.created
          ? `Entreprise de test creee${companyLabel}.`
          : `Entreprise de test deja liee a votre compte${companyLabel}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de preparer l\'entreprise de test.';
      setBootstrapError(message);
    } finally {
      setBootstrapLoading(false);
    }
  }

  return (
    <>
      <TopBar title="Parametres" />
      <div className="flex-1 overflow-y-auto bg-t-bg3 px-4 py-6">
        <div className="max-w-[600px] mx-auto space-y-6">

          {/* Apparence */}
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Apparence</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-caption1 text-t-fg3">Choisissez le theme de l'interface.</p>
              <div className="grid grid-cols-3 gap-3">
                {options.map(({ value, label, desc, icon: Icon }) => {
                  const selected = activeOption === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(value)}
                      className={`flex flex-col items-center gap-2 px-3 py-4 rounded-fluent-lg border-2 transition-colors text-center ${
                        selected
                          ? 'border-t-stroke-brand bg-t-bg-brand-selected'
                          : 'border-t-stroke2 bg-t-bg2 hover:bg-t-bg1-hover'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          selected ? 'bg-t-bg-brand text-white' : 'bg-t-bg4 text-t-fg3'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-caption1 font-semibold ${selected ? 'text-t-fg-brand' : 'text-t-fg1'}`}>
                        {label}
                      </span>
                      <span className="text-caption2 text-t-fg3 leading-tight">{desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Apercu du theme actif */}
              <div className="mt-2 flex items-center gap-2 text-caption2 text-t-fg3">
                <span>Theme actif :</span>
                <span className="font-semibold text-t-fg2">{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </div>
            </div>
          </section>

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Mode test</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-caption1 text-t-fg3">
                Cree ou rattache une entreprise fictive a votre compte connecte pour tester rapidement les ecrans metier.
              </p>
              <button
                onClick={handleBootstrapTestCompany}
                disabled={bootstrapLoading}
                className="inline-flex items-center justify-center rounded-fluent px-4 py-2 text-caption1 font-semibold bg-t-bg-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {bootstrapLoading ? 'Preparation en cours...' : 'Creer / rattacher mon entreprise de test'}
              </button>

              {bootstrapMessage ? <p className="text-caption1 text-green-600">{bootstrapMessage}</p> : null}
              {bootstrapError ? <p className="text-caption1 text-red-600">{bootstrapError}</p> : null}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
