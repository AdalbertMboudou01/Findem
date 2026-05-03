import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, CheckCircle2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { loadCurrentCompanyProfile, saveCurrentCompanyProfile } from '../lib/domainApi';
import { useAuth } from '../lib/AuthContext';

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [sector, setSector] = useState('Technologie');
  const [size, setSize] = useState('PME');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const profile = await loadCurrentCompanyProfile();
        if (!mounted || !profile) return;
        setName(profile.name || '');
        setSector(profile.sector || 'Technologie');
        setSize(profile.size || 'PME');
        setWebsite(profile.website || '');
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

    if (!name.trim() || !sector.trim() || !size.trim()) {
      setError('Nom, secteur et taille sont obligatoires.');
      return;
    }

    try {
      setSaving(true);
      await saveCurrentCompanyProfile({
        name: name.trim(),
        sector: sector.trim(),
        size: size.trim(),
        website: website.trim(),
      });

      updateUser({ onboardingCompleted: true });
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'enregistrer votre entreprise.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="Setup entreprise" subtitle="Configuration initiale de votre espace" />
      <div className="flex-1 overflow-y-auto bg-t-bg3 px-4 py-6">
        <div className="max-w-[640px] mx-auto">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-fluent bg-t-brand-80 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-subtitle1 font-semibold text-t-fg1">Finalisez votre profil entreprise</h1>
            <p className="text-caption1 text-t-fg3 mt-1">
              Cette etape est obligatoire avant la creation des offres.
            </p>
          </div>

          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg px-6 py-6">
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-caption1 text-t-fg3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement du profil entreprise...
              </div>
            ) : success ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-t-success mx-auto mb-3" />
                <p className="text-body1 text-t-fg1 font-semibold">Profil enregistre</p>
                <p className="text-caption1 text-t-fg3 mt-1">Redirection vers votre espace...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
                    {error}
                  </div>
                ) : null}

                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                    placeholder="FinDem"
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Secteur</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    required
                    className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                    placeholder="Technologie"
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Taille</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                  >
                    <option value="Startup">Startup</option>
                    <option value="PME">PME</option>
                    <option value="ETI">ETI</option>
                    <option value="Grande Entreprise">Grande Entreprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Site web</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                    placeholder="https://entreprise.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-9 text-body1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-60 rounded-fluent inline-flex items-center justify-center gap-2 transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer et continuer
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
