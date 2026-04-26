import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  SlidersHorizontal,
  Users,
  Zap,
  Github,
  Star,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import type { Offer, OfferSettings, OfferExigence } from '../types';
import { loadRecruitmentData, loadJobQuotaSettings, saveJobQuotaSettings } from '../lib/domainApi';

// Champs non encore en base : stockés localement (exigence, stack, github, top_n)
const LOCAL_KEY = 'offer_settings_local_v1';

function readLocalSettings(): Record<string, Partial<OfferSettings>> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalSettings(all: Record<string, Partial<OfferSettings>>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

function defaultSettings(offerId: string): OfferSettings {
  return {
    offer_id: offerId,
    max_candidatures: null,
    auto_close: true,
    exigence: 'standard',
    stack_attendue: [],
    importance_github: 'normale',
    types_projets_valorises: '',
    top_n_visible: 10,
  };
}

export function loadOfferSettingsLocal(offerId: string): Omit<OfferSettings, 'max_candidatures' | 'auto_close'> {
  const all = readLocalSettings();
  const d = defaultSettings(offerId);
  return { ...d, ...all[offerId] };
}

const exigenceLevels: { key: OfferExigence; label: string; desc: string }[] = [
  { key: 'standard', label: 'Standard', desc: 'Seuil minimal : motivation + disponibilité' },
  { key: 'selectif', label: 'Sélectif', desc: 'Ajoute une cohérence technique attendue' },
  { key: 'tres_selectif', label: 'Très sélectif', desc: 'Projet cité + stack maîtrisée requis' },
  { key: 'excellence', label: 'Excellence', desc: 'Signaux forts sur tous les axes, GitHub valorisé' },
];

const githubImportance: { key: OfferSettings['importance_github']; label: string; desc: string }[] = [
  { key: 'faible', label: 'Faible', desc: 'Non pris en compte dans la priorisation' },
  { key: 'normale', label: 'Normale', desc: 'Bonus modéré si profil GitHub présent' },
  { key: 'forte', label: 'Forte', desc: 'Signal amplificateur fort pour les profils actifs' },
];

export default function OfferSettings() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [settings, setSettings] = useState<OfferSettings | null>(null);
  const [stackInput, setStackInput] = useState('');
  const [saved, setSaved] = useState(false);
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
        const local = loadOfferSettingsLocal(offerId);
        setSettings({
          ...local,
          offer_id: offerId,
          max_candidatures: quota.maxCandidatures,
          auto_close: quota.autoClose,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [offerId]);

  function update<K extends keyof OfferSettings>(key: K, value: OfferSettings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  function addStack(tech: string) {
    const t = tech.trim();
    if (!t || !settings) return;
    if (!settings.stack_attendue.includes(t)) {
      update('stack_attendue', [...settings.stack_attendue, t]);
    }
    setStackInput('');
  }

  function removeStack(tech: string) {
    if (!settings) return;
    update('stack_attendue', settings.stack_attendue.filter((s) => s !== tech));
  }

  async function handleSave() {
    if (!offerId || !settings) return;
    // Persiste quota au backend
    await saveJobQuotaSettings(offerId, {
      maxCandidatures: settings.max_candidatures,
      autoClose: settings.auto_close,
    });
    // Persiste le reste en localStorage
    const all = readLocalSettings();
    all[offerId] = settings;
    saveLocalSettings(all);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Paramètres de l'offre" />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-caption1 text-t-fg3">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={offer ? `Paramètres — ${offer.title}` : 'Paramètres de l\'offre'}
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
              {saved ? 'Enregistré ✓' : 'Enregistrer'}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[700px] mx-auto px-3 sm:px-6 py-5 space-y-4">

          {/* Section quota */}
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption1 font-medium text-t-fg1">Candidats visibles en shortlist</p>
                  <p className="text-caption2 text-t-fg3 mt-px">Nombre de profils remontés en priorité</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.top_n_visible}
                  onChange={(e) => update('top_n_visible', parseInt(e.target.value) || 10)}
                  className="w-20 h-8 px-2 text-caption1 text-t-fg1 bg-t-bg2 border border-t-stroke2 rounded-fluent text-center focus:outline-none focus:ring-1 focus:ring-t-brand-80"
                />
              </div>
            </div>
          </div>

          {/* Section niveau d'exigence */}
          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-4">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Niveau d'exigence
            </h3>
            <p className="text-caption1 text-t-fg3 mb-3">
              Détermine le seuil de priorisation. N'écarte personne, ajuste le signal de remontée.
            </p>
            <div className="space-y-2">
              {exigenceLevels.map((lvl) => (
                <button
                  key={lvl.key}
                  onClick={() => update('exigence', lvl.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-fluent border text-left transition-colors ${
                    settings.exigence === lvl.key
                      ? 'bg-t-brand-160 border-t-brand-80'
                      : 'bg-t-bg2 border-t-stroke3 hover:border-t-stroke2'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                      settings.exigence === lvl.key
                        ? 'border-t-brand-80 bg-t-brand-80'
                        : 'border-t-stroke2 bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-caption1 font-semibold text-t-fg1">{lvl.label}</span>
                    <span className="text-caption1 text-t-fg3 ml-2">{lvl.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section profil cible */}
          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" /> Profil cible
            </h3>

            <div className="space-y-4">
              {/* Stack attendue */}
              <div>
                <label className="text-caption1 font-semibold text-t-fg2 block mb-1.5">
                  Stack technique attendue
                </label>
                <p className="text-caption2 text-t-fg3 mb-2">
                  Technologies valorisées dans la priorisation (en plus des technos de l'offre)
                </p>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {settings.stack_attendue.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-px text-caption2 bg-t-brand-160 text-t-brand-80 rounded-sm"
                    >
                      {t}
                      <button
                        onClick={() => removeStack(t)}
                        className="hover:text-t-danger transition-colors leading-none"
                        aria-label={`Supprimer ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stackInput}
                    onChange={(e) => setStackInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addStack(stackInput); }
                    }}
                    placeholder="React, Python, Docker…"
                    className="flex-1 h-8 px-3 text-caption1 text-t-fg1 bg-t-bg2 border border-t-stroke2 rounded-fluent focus:outline-none focus:ring-1 focus:ring-t-brand-80 placeholder:text-t-fg3"
                  />
                  <button
                    onClick={() => addStack(stackInput)}
                    className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Types de projets */}
              <div>
                <label className="text-caption1 font-semibold text-t-fg2 block mb-1.5">
                  Types de projets valorisés
                </label>
                <textarea
                  value={settings.types_projets_valorises}
                  onChange={(e) => update('types_projets_valorises', e.target.value)}
                  placeholder="Ex : projets open-source, applications web full-stack, contributions à des bibliothèques connues…"
                  rows={3}
                  className="w-full px-3 py-2 text-caption1 text-t-fg1 bg-t-bg2 border border-t-stroke2 rounded-fluent focus:outline-none focus:ring-1 focus:ring-t-brand-80 placeholder:text-t-fg3 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section importance GitHub */}
          <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">
              <Github className="w-3.5 h-3.5" /> Signal GitHub
            </h3>
            <p className="text-caption1 text-t-fg3 mb-3">
              GitHub n'est jamais bloquant. Ce paramètre ajuste son poids dans la priorisation.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {githubImportance.map((g) => (
                <button
                  key={g.key}
                  onClick={() => update('importance_github', g.key)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-fluent border text-center transition-colors ${
                    settings.importance_github === g.key
                      ? 'bg-t-brand-160 border-t-brand-80'
                      : 'bg-t-bg2 border-t-stroke3 hover:border-t-stroke2'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      settings.importance_github === g.key ? 'text-t-brand-80' : 'text-t-fg3'
                    }`}
                    strokeWidth={1.5}
                  />
                  <span className="text-caption1 font-semibold text-t-fg1">{g.label}</span>
                  <span className="text-caption2 text-t-fg3 leading-tight">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note bas de page */}
          <p className="text-caption2 text-t-fg3 px-1">
            Ces paramètres sont propres à cette offre et guident la priorisation des candidats.
            Ils ne bloquent aucune candidature.
          </p>

        </div>
      </div>
    </div>
  );
}
