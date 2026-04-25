import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  X,
  Copy,
  Check,
  MapPin,
  Users,
  Calendar,
  Pause,
  Play,
  XCircle,
  ChevronDown,
  ChevronUp,
  CopyPlus,
  Star,
  Eye,
  Clock,
  BarChart3,
  Briefcase,
  Link as LinkIcon,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { OfferStatusBadge, TriBadge } from '../components/ui/Badge';
import type { Candidate, Offer, OfferStatus } from '../types';
import { loadRecruitmentData, setOfferStatus, upsertOffer } from '../lib/domainApi';

type OfferFormValues = {
  title: string;
  context: string;
  missions: string;
  service: string;
  location: string;
  contractDuration: string;
  technologies: string[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

const tabs: { key: OfferStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'ouvert', label: 'Ouvertes' },
  { key: 'pause', label: 'En pause' },
  { key: 'cloture', label: 'Cloturees' },
];

function getOfferPipeline(cands: Candidate[]) {
  return {
    total: cands.length,
    prioritaire: cands.filter((c) => c.tri_category === 'prioritaire').length,
    a_examiner: cands.filter((c) => c.tri_category === 'a_examiner').length,
    a_revoir: cands.filter((c) => c.tri_category === 'a_revoir').length,
    a_ecarter: cands.filter((c) => c.tri_category === 'a_ecarter').length,
    completed: cands.filter((c) => c.chatbot_completed).length,
  };
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      pause: offers.filter((o) => o.status === 'pause').length,
      cloture: offers.filter((o) => o.status === 'cloture').length,
    }),
    [offers],
  );

  function copyUrl(id: string) {
    const url = `${window.location.origin}/apply/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

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

  async function handleOfferStatusChange(offerId: string, nextStatus: OfferStatus) {
    setActionError('');
    setBusyOfferId(offerId);
    try {
      await setOfferStatus(offerId, nextStatus);
      await refreshData(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible de mettre a jour le statut de l\'offre.');
    } finally {
      setBusyOfferId(null);
    }
  }

  async function handleSaveOffer(values: OfferFormValues) {
    setActionError('');
    setSaving(true);
    try {
      await upsertOffer(selectedOffer?.id || null, {
        ...values,
        rythme: values.contractDuration,
      });
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
        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 sm:px-6 py-3 bg-t-bg2 border-b border-t-stroke3 shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-t-fg3" strokeWidth={1.5} />
            <span className="text-caption1 text-t-fg3">{statusCounts.all} offres</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-t-success" />
            <span className="text-caption1 text-t-fg2">{statusCounts.ouvert} ouvertes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-t-warning" />
            <span className="text-caption1 text-t-fg2">{statusCounts.pause} en pause</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-t-danger" />
            <span className="text-caption1 text-t-fg2">{statusCounts.cloture} cloturees</span>
          </div>
          <div className="sm:ml-auto flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-t-fg3" />
            <span className="text-caption1 text-t-fg3">{candidates.length} candidats au total</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-t-stroke2 bg-t-bg1 px-4 sm:px-6 shrink-0 overflow-x-auto">
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
              const pipeline = getOfferPipeline(offerCandidates);
              const isExpanded = expandedId === o.id;
              const completionRate = pipeline.total > 0
                ? Math.round((pipeline.completed / pipeline.total) * 100)
                : 0;

              return (
                <div
                  key={o.id}
                  className="bg-t-bg1 border border-t-stroke3 rounded-fluent hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-shadow"
                >
                  <div className="px-3 sm:px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => { setSelectedOffer(o); setShowModal(true); }}
                            className="text-body1 font-semibold text-t-fg1 hover:text-t-fg-brand hover:underline transition-colors text-left truncate"
                          >
                            {o.title}
                          </button>
                          <OfferStatusBadge status={o.status} />
                          {daysSince(o.created_at) <= 7 && (
                            <span className="px-1.5 py-px text-caption2 font-medium bg-t-brand-160 text-t-brand-80 rounded-sm">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-caption1 text-t-fg3 mt-1 line-clamp-1">{o.context}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-caption1 text-t-fg3">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{o.location}</span>
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{pipeline.total} candidats</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(o.created_at)}</span>
                          <span>{o.rythme}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {o.technologies.map((t) => (
                            <span key={t} className="px-1.5 py-px text-caption2 bg-t-bg3 text-t-fg2 rounded-sm">{t}</span>
                          ))}
                        </div>
                      </div>

                      {/* Mini pipeline */}
                      <div className="shrink-0 hidden sm:flex flex-col items-end gap-1.5 pt-1">
                        <div className="flex items-center gap-2 text-caption2">
                          <span className="text-t-success font-medium">{pipeline.prioritaire}</span>
                          <span className="text-t-brand-80 font-medium">{pipeline.a_examiner}</span>
                          <span className="text-t-warning font-medium">{pipeline.a_revoir}</span>
                          <span className="text-t-danger font-medium">{pipeline.a_ecarter}</span>
                        </div>
                        <div className="flex h-1.5 w-24 rounded-full overflow-hidden bg-t-bg4">
                          {pipeline.total > 0 && (
                            <>
                              <div className="bg-t-success" style={{ width: `${(pipeline.prioritaire / pipeline.total) * 100}%` }} />
                              <div className="bg-t-brand-80" style={{ width: `${(pipeline.a_examiner / pipeline.total) * 100}%` }} />
                              <div className="bg-t-warning" style={{ width: `${(pipeline.a_revoir / pipeline.total) * 100}%` }} />
                              <div className="bg-t-danger" style={{ width: `${(pipeline.a_ecarter / pipeline.total) * 100}%` }} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable detail section */}
                  {isExpanded && (
                    <div className="px-3 sm:px-5 pb-4 border-t border-t-stroke3 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left: missions + service */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1.5">Missions</h4>
                            <p className="text-caption1 text-t-fg2 leading-relaxed whitespace-pre-line">{o.missions}</p>
                          </div>
                          <div>
                            <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1">Service</h4>
                            <p className="text-caption1 text-t-fg2">{o.service}</p>
                          </div>
                          <div>
                            <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1">Lien chatbot</h4>
                            <div className="flex items-center gap-2">
                              <code className="text-caption2 text-t-fg3 bg-t-bg3 px-2 py-1 rounded-fluent truncate max-w-[260px]">
                                {window.location.origin}/apply/{o.id}
                              </code>
                              <button
                                onClick={() => copyUrl(o.id)}
                                className="text-t-fg-brand hover:text-t-fg-brand-hover transition-colors"
                              >
                                {copiedId === o.id ? <Check className="w-3.5 h-3.5 text-t-success" /> : <LinkIcon className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right: pipeline breakdown */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-2">Pipeline candidats</h4>
                            <div className="space-y-2">
                              <PipelineRow icon={Star} label="Prioritaires" count={pipeline.prioritaire} total={pipeline.total} color="bg-t-success" />
                              <PipelineRow icon={Eye} label="A examiner" count={pipeline.a_examiner} total={pipeline.total} color="bg-t-brand-80" />
                              <PipelineRow icon={Clock} label="A revoir" count={pipeline.a_revoir} total={pipeline.total} color="bg-t-warning" />
                              <PipelineRow icon={XCircle} label="Ecartes" count={pipeline.a_ecarter} total={pipeline.total} color="bg-t-danger" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1.5">Taux de completion</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-t-bg4 rounded-full overflow-hidden">
                                <div className="h-full bg-t-brand-80 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                              </div>
                              <span className="text-caption2 text-t-fg2 font-medium">{completionRate}%</span>
                            </div>
                          </div>

                          {/* Recent candidates for this offer */}
                          {offerCandidates.length > 0 && (
                            <div>
                              <h4 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-1.5">Derniers candidats</h4>
                              <div className="space-y-1">
                                {offerCandidates.slice(0, 3).map((c) => (
                                  <div key={c.id} className="flex items-center gap-2 py-1">
                                    <div className="w-6 h-6 rounded-full bg-t-brand-160 flex items-center justify-center text-caption2 font-semibold text-t-brand-80 shrink-0">
                                      {c.first_name[0]}{c.last_name[0]}
                                    </div>
                                    <span className="text-caption1 text-t-fg1 truncate">{c.first_name} {c.last_name}</span>
                                    <TriBadge category={c.tri_category} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions bar */}
                  <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-2.5 border-t border-t-stroke3 bg-t-bg2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Reduire' : 'Details'}
                    </button>
                    <button
                      onClick={() => { setSelectedOffer(o); setShowModal(true); }}
                      className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                    >
                      <BarChart3 className="w-3 h-3" />Modifier
                    </button>
                    <button
                      onClick={() => copyUrl(o.id)}
                      className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                    >
                      {copiedId === o.id ? <><Check className="w-3 h-3 text-t-success" />Copie !</> : <><Copy className="w-3 h-3" />Lien chatbot</>}
                    </button>
                    <button
                      onClick={() => handleDuplicate(o)}
                      className="h-7 px-2.5 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                    >
                      <CopyPlus className="w-3 h-3" />Dupliquer
                    </button>
                    <div className="flex-1" />
                    {o.status === 'ouvert' && (
                      <button
                        onClick={() => handleOfferStatusChange(o.id, 'pause')}
                        disabled={busyOfferId === o.id}
                        className="h-7 px-2.5 text-caption1 font-medium text-t-warning hover:bg-t-warning-bg disabled:opacity-40 rounded-fluent inline-flex items-center gap-1 transition-colors"
                      >
                        <Pause className="w-3 h-3" />Pause
                      </button>
                    )}
                    {o.status === 'pause' && (
                      <button
                        onClick={() => handleOfferStatusChange(o.id, 'ouvert')}
                        disabled={busyOfferId === o.id}
                        className="h-7 px-2.5 text-caption1 font-medium text-t-success hover:bg-t-success-bg disabled:opacity-40 rounded-fluent inline-flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />Rouvrir
                      </button>
                    )}
                    {o.status !== 'cloture' && (
                      <button
                        onClick={() => handleOfferStatusChange(o.id, 'cloture')}
                        disabled={busyOfferId === o.id}
                        className="h-7 px-2.5 text-caption1 font-medium text-t-danger hover:bg-t-danger-bg disabled:opacity-40 rounded-fluent inline-flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />Cloturer
                      </button>
                    )}
                  </div>
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

function PipelineRow({ icon: Icon, label, count, total, color }: {
  icon: typeof Star;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 text-t-fg3" strokeWidth={1.5} />
      <span className="text-caption1 text-t-fg2 w-20">{label}</span>
      <div className="flex-1 h-1 bg-t-bg4 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-caption2 text-t-fg2 font-medium w-5 text-right">{count}</span>
    </div>
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
  const [context, setContext] = useState(offer?.context || '');
  const [missions, setMissions] = useState(offer?.missions || '');
  const [service, setService] = useState(offer?.service || '');
  const [location, setLocation] = useState(offer?.location || '');
  const [contractDuration, setContractDuration] = useState(offer?.rythme || '');
  const [technologies, setTechnologies] = useState((offer?.technologies || []).join(', '));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      title: title.trim(),
      context: context.trim(),
      missions: missions.trim(),
      service: service.trim(),
      location: location.trim(),
      contractDuration: contractDuration.trim(),
      technologies: technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
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
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Contexte *</label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Decrivez le contexte de l'equipe, la stack, l'environnement..."
              required
              className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
            />
          </div>
          <div>
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Missions *</label>
            <textarea
              rows={4}
              value={missions}
              onChange={(e) => setMissions(e.target.value)}
              placeholder="Listez les missions principales de l'alternant..."
              required
              className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
            />
          </div>
          <div>
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Service / Equipe *</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Ex: Engineering - Equipe Produit"
              required
              className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Lieu</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Paris - Hybrid"
                required
                className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>
            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Duree du contrat</label>
              <input
                type="text"
                value={contractDuration}
                onChange={(e) => setContractDuration(e.target.value)}
                placeholder="Ex: 12 mois"
                className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>
          </div>
          <div>
            <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Technologies</label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Ex: React, TypeScript, Node.js (separes par des virgules)"
              className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-t-stroke2">
          <button type="button" onClick={onClose} className="h-8 px-4 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="h-8 px-4 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors">
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : isDuplicate ? 'Creer la copie' : 'Creer l\'offre'}
          </button>
        </div>
      </form>
    </div>
  );
}
