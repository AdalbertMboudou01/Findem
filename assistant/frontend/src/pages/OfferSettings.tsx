import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import type { Offer, OfferStatus } from '../types';
import { loadRecruitmentData, loadJobQuotaSettings, saveJobQuotaSettings, setOfferStatus, upsertOffer } from '../lib/domainApi';

type OfferQuotaSettings = {
  max_candidatures: number | null;
  auto_close: boolean;
};

type OfferEditSettings = {
  title: string;
  description: string;
  location: string;
  contractDuration: string;
  status: OfferStatus;
};

export default function OfferSettings() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [settings, setSettings] = useState<OfferQuotaSettings | null>(null);
  const [offerForm, setOfferForm] = useState<OfferEditSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId) return;
    (async () => {
      try {
        const [data, quota] = await Promise.all([
          loadRecruitmentData(),
          loadJobQuotaSettings(offerId).catch(() => ({ maxCandidatures: null, autoClose: true })),
        ]);
        const found = data.offers.find((o) => o.id === offerId) ?? null;
        setOffer(found);
        if (found) {
          setOfferForm({
            title: found.title || '',
            description: found.context || found.missions || '',
            location: found.location === 'Non renseigne' ? '' : (found.location || ''),
            contractDuration: ['6 mois', '12 mois', '24 mois', '36 mois'].includes(found.rythme)
              ? found.rythme
              : '',
            status: found.status,
          });
        }
        setSettings({
          max_candidatures: quota.maxCandidatures,
          auto_close: quota.autoClose,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [offerId]);

  function update<K extends keyof OfferQuotaSettings>(key: K, value: OfferQuotaSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
    setError('');
  }

  function updateOffer<K extends keyof OfferEditSettings>(key: K, value: OfferEditSettings[K]) {
    setOfferForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
    setError('');
  }

  async function handleSave() {
    if (!offerId || !settings || !offerForm) return;
    try {
      setError('');
      await upsertOffer(offerId, {
        title: offerForm.title.trim(),
        description: offerForm.description.trim(),
        location: offerForm.location.trim(),
        contractDuration: offerForm.contractDuration.trim(),
      });
      await setOfferStatus(offerId, offerForm.status);
      await saveJobQuotaSettings(offerId, {
        maxCandidatures: settings.max_candidatures,
        autoClose: settings.auto_close,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'enregistrer les parametres.');
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Parametres de l'offre" subtitle="Quota de candidatures" />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-caption1 text-t-fg3">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!settings || !offerForm) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={offer ? `Parametres - ${offer.title}` : 'Parametres de l\'offre'}
        subtitle="Modifier l'offre et gerer le quota"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/offers')}
              className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            <button
              onClick={handleSave}
              className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Enregistre' : 'Enregistrer'}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[700px] mx-auto px-3 sm:px-6 py-5 space-y-4">
          {error && (
            <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
              {error}
            </div>
          )}

          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-4">
              <FileText className="w-3.5 h-3.5" /> Modifier l'offre
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Titre</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => updateOffer('title', e.target.value)}
                  className="w-full h-8 px-3 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={offerForm.description}
                  onChange={(e) => updateOffer('description', e.target.value)}
                  className="w-full px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={offerForm.location}
                    onChange={(e) => updateOffer('location', e.target.value)}
                    className="w-full h-8 px-3 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Duree alternance</label>
                  <select
                    value={offerForm.contractDuration}
                    onChange={(e) => updateOffer('contractDuration', e.target.value)}
                    className="w-full h-8 px-3 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                  >
                    <option value="">Non renseignee</option>
                    <option value="6 mois">6 mois</option>
                    <option value="12 mois">12 mois</option>
                    <option value="24 mois">24 mois</option>
                    <option value="36 mois">36 mois</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Statut</label>
                <select
                  value={offerForm.status}
                  onChange={(e) => updateOffer('status', e.target.value as OfferStatus)}
                  className="w-full h-8 px-3 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                >
                  <option value="ouvert">Ouverte</option>
                  <option value="cloture">Clôturée</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" /> Quota de candidatures
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption1 font-medium text-t-fg1">Nombre maximum de candidatures</p>
                  <p className="text-caption2 text-t-fg3 mt-px">Laisser vide pour ne pas limiter</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  placeholder="—"
                  value={settings.max_candidatures ?? ''}
                  onChange={(e) =>
                    update('max_candidatures', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-20 h-8 px-2 text-caption1 text-t-fg1 bg-t-bg2 border border-t-stroke2 rounded-fluent text-center focus:outline-none focus:ring-1 focus:ring-t-brand-80"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption1 font-medium text-t-fg1">Fermeture automatique</p>
                  <p className="text-caption2 text-t-fg3 mt-px">
                    Le chatbot se ferme quand le quota est atteint
                  </p>
                </div>
                <button
                  onClick={() => update('auto_close', !settings.auto_close)}
                  className="text-t-brand-80 hover:text-t-brand-100 transition-colors"
                  aria-label="Activer/désactiver fermeture auto"
                >
                  {settings.auto_close ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-t-fg3" />
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
