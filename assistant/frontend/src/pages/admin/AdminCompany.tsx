import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Loader2, Save } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import { loadCurrentCompanyProfile, saveCurrentCompanyProfile, type CompanyProfile } from '../../lib/domainApi';
import { useAuth } from '../../lib/AuthContext';

const sizeOptions = ['Startup', 'PME', 'ETI', 'Grande Entreprise'];

export default function AdminCompany() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    sector: '',
    size: 'PME',
    website: '',
    plan: 'starter',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadCurrentCompanyProfile();
        if (!mounted) return;
        setProfile(data);
        if (data) {
          setForm({
            name: data.name,
            sector: data.sector,
            size: data.size || 'PME',
            website: data.website,
            plan: data.plan || 'starter',
          });
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger le profil entreprise.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!form.name.trim() || !form.sector.trim() || !form.size.trim()) {
      setError('Nom, secteur et taille sont obligatoires.');
      return;
    }

    try {
      setSaving(true);
      const updated = await saveCurrentCompanyProfile({
        name: form.name.trim(),
        sector: form.sector.trim(),
        size: form.size.trim(),
        website: form.website.trim(),
        plan: form.plan,
      });
      setProfile(updated);
      updateUser({ onboardingCompleted: true });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'entreprise.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="Entreprise" subtitle="Identité et informations administratives" />
      <main className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-5 space-y-4">
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-fluent bg-t-bg-brand-selected flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-t-fg-brand" />
              </div>
              <div>
                <h1 className="text-subtitle1 font-semibold text-t-fg1">{profile?.name || 'Profil entreprise'}</h1>
                <p className="text-caption1 text-t-fg3 mt-1">
                  Ces informations cadrent l'espace Admin. Elles restent volontairement simples.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
            {loading ? (
              <div className="py-10 flex items-center justify-center gap-2 text-caption1 text-t-fg3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
                    {error}
                  </div>
                )}
                {saved && (
                  <div className="px-3 py-2 text-caption1 text-t-success bg-t-success-bg border border-t-stroke3 rounded-fluent inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Profil enregistré.
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nom de l'entreprise">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                      required
                    />
                  </Field>
                  <Field label="Secteur">
                    <input
                      value={form.sector}
                      onChange={(e) => setForm((current) => ({ ...current, sector: e.target.value }))}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                      required
                    />
                  </Field>
                  <Field label="Taille">
                    <select
                      value={form.size}
                      onChange={(e) => setForm((current) => ({ ...current, size: e.target.value }))}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Site web">
                    <input
                      value={form.website}
                      onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                      placeholder="https://entreprise.com"
                    />
                  </Field>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-9 px-4 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-caption1 font-semibold text-t-fg2 mb-1">{label}</span>
      {children}
    </label>
  );
}
