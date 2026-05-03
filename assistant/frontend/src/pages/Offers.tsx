import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  MapPin,
  Users,
  Calendar,
  CopyPlus,
  Briefcase,
  SlidersHorizontal,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { OfferStatusBadge } from '../components/ui/Badge';
import type { Candidate, Offer, OfferStatus } from '../types';
import { loadRecruitmentData, upsertOffer, getAnalysisQualityMetrics, type AnalysisQualityMetrics } from '../lib/domainApi';

type OfferFormValues = {
  title: string;
  description: string;
  location: string;
  contractDuration: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPercent(n: number | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return `${Math.round(n * 100)} %`;
}

/** Métriques d'analyse affichées dans le panneau d'une offre */
function OfferQualityBlock() {
  const [metrics, setMetrics] = useState<AnalysisQualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAnalysisQualityMetrics(30);
      setMetrics(data);
    } catch {
      setError('Impossible de charger les métriques.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="mt-4 border-t border-t-stroke3 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-t-fg3" />
          <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Performance analyse</h4>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1 text-caption2 text-t-fg3 hover:text-t-fg2 disabled:opacity-50"
          title="Actualiser"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {error && <p className="text-caption2 text-t-danger">{error}</p>}

      {!error && metrics && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-fluent border border-t-stroke3 p-3 bg-t-bg2">
              <p className="text-caption2 text-t-fg3">Précision estimée</p>
              <p className="text-body1 font-semibold text-t-fg1">{formatPercent(metrics.precisionScore)}</p>
            </div>
            <div className="rounded-fluent border border-t-stroke3 p-3 bg-t-bg2">
              <p className="text-caption2 text-t-fg3">Taux correction</p>
              <p className="text-body1 font-semibold text-t-fg1">{formatPercent(metrics.correctionRate)}</p>
            </div>
            <div className="rounded-fluent border border-t-stroke3 p-3 bg-t-bg2">
              <p className="text-caption2 text-t-fg3">Taux rejet</p>
              <p className="text-body1 font-semibold text-t-fg1">{formatPercent(metrics.rejectionRate)}</p>
            </div>
          </div>

          {metrics.byDimension.length > 0 && (
            <div className="mt-3 space-y-2">
              {metrics.byDimension.slice(0, 4).map((dim) => (
                <div key={dim.dimension} className="flex items-center gap-3 text-caption2">
                  <span className="text-t-fg2 capitalize w-28 shrink-0">{dim.dimension}</span>
                  <div className="flex-1 bg-t-bg4 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-t-brand-80"
                      style={{ width: `${Math.round((dim.precisionScore ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-t-fg3 w-10 text-right">{formatPercent(dim.precisionScore)}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-caption2 text-t-fg-disabled mt-2">
            Basé sur {metrics.reviewedFacts} constats · {metrics.windowDays} derniers jours
          </p>
        </>
      )}
    </div>
  );
}



const tabs: { key: OfferStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'ouvert', label: 'Ouvertes' },
  { key: 'cloture', label: 'Clôturées' },
];

export default function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function refreshData(isFirstLoad = false) {
    if (isFirstLoad) setLoading(true);
    try {
      const data = await loadRecruitmentData();
      setOffers(data.offers);
      setCandidates(data.candidates);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les offres.');
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  }

  useEffect(() => {
    refreshData(true);
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? offers : offers.filter((o) => o.status === filter)),
    [filter, offers],
  );

  const statusCounts = useMemo(
    () => ({
      all: offers.length,
      ouvert: offers.filter((o) => o.status === 'ouvert').length,
      cloture: offers.filter((o) => o.status === 'cloture').length,
    }),
    [offers],
  );

  function handleDuplicate(offer: Offer) {
    setSelectedOffer({
      ...offer,
      id: '',
      title: `${offer.title} (copie)`,
      status: 'ouvert',
      candidates_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setShowModal(true);
  }

  function statusMessage(status: OfferStatus) {
    if (status === 'cloture') return 'clôturée';
    return 'ouverte';
  }

  function handleConfigureQuestionnaire(offer: Offer) {
    if (offer.status !== 'ouvert') {
      setActionError(`Cette offre est ${statusMessage(offer.status)}. Impossible de configurer le questionnaire.`);
      return;
    }
    setActionError('');
    navigate(`/chatbot?jobId=${offer.id}&from=offer-setup`);
  }

  async function handleSaveOffer(values: OfferFormValues) {
    setActionError('');
    setSaving(true);
    try {
      await upsertOffer(selectedOffer?.id || null, values);
      setShowModal(false);
      setSelectedOffer(null);
      await refreshData(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible d\'enregistrer l\'offre.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar
        title="Offres"
        subtitle="Titre, description, lieu et duree alternance"
        actions={
          <button
            onClick={() => { setSelectedOffer(null); setShowModal(true); }}
            className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle offre
          </button>
        }
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-t-stroke2 bg-t-bg1 px-4 sm:px-6 shrink-0">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-3 text-caption1 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.key
                    ? 'border-t-stroke-brand text-t-fg-brand'
                    : 'border-transparent text-t-fg3 hover:text-t-fg2'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-caption2 text-t-fg3">
                  {statusCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="h-7 px-2 rounded-fluent text-caption2 text-t-fg3 hover:text-t-fg2 hover:bg-t-bg1-hover transition-colors"
              >
                Reinitialiser
              </button>
            )}
            <span className="text-caption2 text-t-fg3">{filtered.length} affichees</span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-t-bg3">
          <div className="max-w-[900px] mx-auto px-3 sm:px-6 py-4 space-y-2">
            {loading && (
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">
                Chargement des offres...
              </div>
            )}
            {!loading && error && (
              <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
                {error}
              </div>
            )}
            {!loading && !error && actionError && (
              <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
                {actionError}
              </div>
            )}
            {filtered.map((o) => {
              const offerCandidates = candidates.filter((c) => c.offer_id === o.id);
              const candidatesCount = offerCandidates.length;
              const isExpanded = expandedId === o.id;
              return (
                <div
                  key={o.id}
                  className="bg-t-bg1 border border-t-stroke3 rounded-fluent hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:-translate-y-px transition-all"
                >
                  <div className="px-3 sm:px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : o.id)}
                            className="text-body1 font-semibold text-t-fg1 hover:text-t-fg-brand hover:underline transition-colors text-left truncate"
                          >
                            {o.title}
                          </button>
                          <OfferStatusBadge status={o.status} />
                        </div>
                        <p className="text-caption1 text-t-fg3 mt-1 line-clamp-1">{o.context}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-caption1 text-t-fg3">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{o.location}</span>
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{candidatesCount} candidats</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(o.created_at)}</span>
                          <span>{o.rythme}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {o.technologies.map((t) => (
                            <span key={t} className="px-1.5 py-px text-caption2 bg-t-bg3 text-t-fg2 rounded-sm">{t}</span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Expandable detail section */}
                  {isExpanded && (
                    <div className="px-3 sm:px-5 pb-4 border-t border-t-stroke3 pt-4">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Link
                          to={`/offers/${o.id}/settings`}
                          className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                        >
                          <SlidersHorizontal className="w-3 h-3" />Parametres
                        </Link>
                        <button
                          onClick={() => handleDuplicate(o)}
                          className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                        >
                          <CopyPlus className="w-3 h-3" />Dupliquer
                        </button>
                      </div>

                      <div>
                        <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1">Questionnaire</h4>
                        <button
                          onClick={() => handleConfigureQuestionnaire(o)}
                          className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 bg-t-bg1 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Configurer questionnaire
                        </button>
                      </div>

                      <OfferQualityBlock />
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Briefcase className="w-10 h-10 text-t-fg-disabled mb-3" strokeWidth={1} />
                <p className="text-body1 font-semibold text-t-fg2 mb-1">Aucune offre dans cette categorie</p>
                <p className="text-caption1 text-t-fg3">Creez une nouvelle offre pour commencer a recevoir des candidatures.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <OfferModal
          offer={selectedOffer}
          onClose={() => setShowModal(false)}
          onSave={handleSaveOffer}
          saving={saving}
          error={actionError}
        />
      )}
    </>
  );
}

function OfferModal({
  offer,
  onClose,
  onSave,
  saving,
  error,
}: {
  offer: Offer | null;
  onClose: () => void;
  onSave: (values: OfferFormValues) => Promise<void>;
  saving: boolean;
  error: string;
}) {
  const isEdit = offer !== null && offer.id !== '';
  const isDuplicate = offer !== null && offer.id === '';

  const [title, setTitle] = useState(offer?.title || '');
  const [description, setDescription] = useState(offer?.context || '');
  const [location, setLocation] = useState(offer?.location === 'Non renseigne' ? '' : (offer?.location || ''));
  const [contractDuration, setContractDuration] = useState(
    ['6 mois', '12 mois', '24 mois', '36 mois'].includes(offer?.rythme || '') ? (offer?.rythme || '') : '',
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      contractDuration: contractDuration.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <form className="bg-t-bg1 rounded-fluent-lg shadow-xl w-full max-w-[calc(100%-1rem)] sm:max-w-[640px] max-h-[85vh] flex flex-col mx-2 sm:mx-0" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-t-stroke2">
          <div>
            <h2 className="text-subtitle2 font-semibold text-t-fg1">
              {isEdit ? 'Modifier l\'offre' : isDuplicate ? 'Dupliquer l\'offre' : 'Nouvelle offre'}
            </h2>
            {isDuplicate && (
              <p className="text-caption1 text-t-fg3 mt-0.5">Les candidats ne seront pas copies</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-t-danger rounded-fluent">
              {error}
            </div>
          )}
          <div>
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Titre du poste *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Developpeur Full-Stack React/Node.js"
              required
              className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
            />
          </div>
          <div>
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Description minimale *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Decrivez l'essentiel de l'offre en quelques lignes..."
              required
              className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Lieu</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Paris"
                className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>
            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Duree alternance</label>
              <select
                value={contractDuration}
                onChange={(e) => setContractDuration(e.target.value)}
                className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
              >
                <option value="">Non renseignee</option>
                <option value="6 mois">6 mois</option>
                <option value="12 mois">12 mois</option>
                <option value="24 mois">24 mois</option>
                <option value="36 mois">36 mois</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-t-stroke2">
          <button type="button" onClick={onClose} className="h-8 px-4 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-8 px-4 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors"
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : isDuplicate ? 'Creer la copie' : 'Creer l\'offre'}
          </button>
        </div>
      </form>
    </div>
  );
}
