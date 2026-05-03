import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ChevronDown, Search, Users, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { TriBadge } from '../components/ui/Badge';
import { loadRecruitmentData, loadTeamView } from '../lib/domainApi';
import type { TeamViewEntry, TeamViewKey } from '../lib/domainApi';
import type { Candidate, CandidateStatus, Offer, TriCategory } from '../types';

type TriFilter = TriCategory | 'all';
type ViewTab = 'all' | TeamViewKey;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '<1h';
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

const triTabs: { key: TriFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'prioritaire', label: 'Prioritaires' },
  { key: 'a_examiner', label: 'A examiner' },
  { key: 'a_revoir', label: 'A revoir' },
  { key: 'a_ecarter', label: 'Ecartes' },
];

const VIEW_TABS: { key: ViewTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all',              label: 'Toutes',           icon: <Users className="w-3.5 h-3.5" /> },
  { key: 'attente_avis',    label: "Attente d'avis",   icon: <Clock className="w-3.5 h-3.5" /> },
  { key: 'pret_a_decider',  label: 'Prêt à décider',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { key: 'attente_candidat',label: 'Attente candidat',  icon: <UserCheck className="w-3.5 h-3.5" /> },
];

/** Traduit un code status backend en libellé lisible */
function statusLabel(code: string): string {
  const map: Record<string, string> = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    en_attente_avis: 'Attente avis',
    entretien: 'Entretien',
    retenu: 'Retenu',
    retenu_entretien: 'Retenu',
    refuse: 'Refusé',
    non_retenu: 'Non retenu',
    pret_a_decider: 'À décider',
    attente_candidat: 'Att. candidat',
  };
  return map[code] ?? code.replace(/_/g, ' ');
}

/** Couleurs CSS-vars pour le badge status en vue équipe */
function statusBadgeClass(code: string): string {
  if (['retenu', 'retenu_entretien'].includes(code)) return 'bg-t-bg-brand-selected text-t-brand-80';
  if (['refuse', 'non_retenu'].includes(code))        return 'bg-t-danger-bg text-t-danger';
  if (['entretien', 'pret_a_decider'].includes(code)) return 'bg-t-warning-bg text-t-warning';
  return 'bg-t-bg4 text-t-fg3';
}

export default function Candidates() {
  const { id: selectedId } = useParams<{ id: string }>();

  // ── Données de base ─────────────────────────────────────────────────────────
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Onglet principal (Toutes / Vue équipe) ───────────────────────────────────
  const [viewTab, setViewTab] = useState<ViewTab>('all');
  const [teamEntries, setTeamEntries] = useState<TeamViewEntry[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // ── Filtres mode "Toutes" ────────────────────────────────────────────────────
  const [triFilter, setTriFilter] = useState<TriFilter>('all');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [offerFilter, setOfferFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Chargement initial (offres + candidats)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadRecruitmentData();
        if (!mounted) return;
        setCandidates(data.candidates);
        setOffers(data.offers);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les candidats.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Chargement vue équipe quand on bascule sur un onglet équipe
  useEffect(() => {
    if (viewTab === 'all') return;
    let mounted = true;
    setLoadingTeam(true);
    loadTeamView(viewTab as TeamViewKey)
      .then((data) => { if (mounted) setTeamEntries(data); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingTeam(false); });
    return () => { mounted = false; };
  }, [viewTab]);

  // ── Filtres "Toutes" ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (triFilter !== 'all' && c.tri_category !== triFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (offerFilter !== 'all' && c.offer_id !== offerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${c.first_name} ${c.last_name}`.toLowerCase();
        if (!name.includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [candidates, triFilter, statusFilter, offerFilter, search]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: candidates.length };
    for (const c of candidates) m[c.tri_category] = (m[c.tri_category] || 0) + 1;
    return m;
  }, [candidates]);

  // Map application_id → Candidate (pour la vue équipe)
  const candidateByAppId = useMemo(() => {
    const m = new Map<string, Candidate>();
    for (const c of candidates) {
      if (c.application_id) m.set(c.application_id, c);
      m.set(c.id, c);
    }
    return m;
  }, [candidates]);

  // Map offer_id → title (pour la vue équipe)
  const offerTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of offers) m.set(o.id, o.title);
    return m;
  }, [offers]);

  function resetFilters() {
    setTriFilter('all');
    setStatusFilter('all');
    setOfferFilter('all');
    setSearch('');
  }

  const isEquipeMode = viewTab !== 'all';

  return (
    <>
      <TopBar title="Candidats" subtitle="Tri collaboratif et suivi individuel" />

      {/* ── Onglets principaux (Toutes / Vue équipe) ─────────────────────────── */}
      <div className="flex items-center gap-1 px-4 sm:px-5 py-0 bg-t-bg1 border-b border-t-stroke3 shrink-0 overflow-x-auto">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-caption2 font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              viewTab === tab.key
                ? 'border-t-stroke-brand text-t-fg-brand'
                : 'border-transparent text-t-fg3 hover:text-t-fg2'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-panel shrink-0 border-r border-t-stroke2 flex flex-col bg-t-bg2 ${selectedId ? 'hidden md:flex' : 'flex'}`}>

          {/* ── Filtres (uniquement en mode "Toutes") ───────────────────────── */}
          {!isEquipeMode && (
            <>
              <div className="flex items-center border-b border-t-stroke3 px-1 shrink-0 overflow-x-auto">
                {triTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTriFilter(tab.key)}
                    className={`flex-1 px-1 py-2.5 text-caption2 font-semibold border-b-2 transition-colors text-center whitespace-nowrap ${
                      triFilter === tab.key
                        ? 'border-t-stroke-brand text-t-fg-brand'
                        : 'border-transparent text-t-fg3 hover:text-t-fg2'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-0.5 text-t-fg-disabled">{counts[tab.key] || 0}</span>
                  </button>
                ))}
              </div>

              <div className="px-3 py-2 space-y-2 border-b border-t-stroke3 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-fg3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full h-8 pl-8 pr-2 text-caption1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
                  />
                </div>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as CandidateStatus | 'all')}
                      className="w-full appearance-none h-8 pl-2 pr-7 text-caption1 bg-t-bg1 border border-t-stroke2 rounded-fluent text-t-fg2 outline-none cursor-pointer"
                    >
                      <option value="all">Statut</option>
                      <option value="en_attente">En attente</option>
                      <option value="retenu_entretien">Retenu</option>
                      <option value="a_revoir_manuellement">A revoir</option>
                      <option value="non_retenu">Non retenu</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-t-fg3 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={offerFilter}
                      onChange={(e) => setOfferFilter(e.target.value)}
                      className="w-full appearance-none h-8 pl-2 pr-7 text-caption1 bg-t-bg1 border border-t-stroke2 rounded-fluent text-t-fg2 outline-none cursor-pointer"
                    >
                      <option value="all">Offre</option>
                      {offers.map((o) => (
                        <option key={o.id} value={o.id}>{o.title.split(' ').slice(0, 2).join(' ')}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-t-fg3 pointer-events-none" />
                  </div>
                </div>
                {(triFilter !== 'all' || statusFilter !== 'all' || offerFilter !== 'all' || !!search) && (
                  <button
                    onClick={resetFilters}
                    className="h-7 px-2 rounded-fluent text-caption2 text-t-fg3 hover:text-t-fg2 hover:bg-t-bg1 transition-colors"
                  >
                    Reinitialiser les filtres
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Liste ───────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* Mode "Toutes" */}
            {!isEquipeMode && (
              <>
                {loading && (
                  <div className="px-4 py-10 text-center text-caption1 text-t-fg3">Chargement des candidats...</div>
                )}
                {!loading && error && (
                  <div className="px-4 py-10 text-center text-caption1 text-t-danger">{error}</div>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <div className="px-4 py-10 text-center text-caption1 text-t-fg3">Aucun resultat</div>
                )}
                {!loading && !error && filtered.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <Link
                      key={c.id}
                      to={`/candidates/${c.id}`}
                      className={`flex items-center gap-3 px-3 py-3 border-l-[3px] transition-colors ${
                        active
                          ? 'bg-t-bg-subtle-selected border-l-t-stroke-brand'
                          : 'hover:bg-t-bg-subtle-hover border-l-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-t-brand-160 flex items-center justify-center text-caption2 font-semibold text-t-brand-80 shrink-0">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-body1 truncate ${active ? 'font-semibold' : ''} text-t-fg1`}>
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="text-caption2 text-t-fg3 shrink-0">{timeAgo(c.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <TriBadge category={c.tri_category} />
                          {c.offer_id && offers.find(o => o.id === c.offer_id) && (
                            <span className="text-caption2 text-t-fg-disabled truncate max-w-[160px]">
                              {offers.find(o => o.id === c.offer_id)?.title.split(' ').slice(0, 3).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}

            {/* Mode "Vue équipe" */}
            {isEquipeMode && (
              <>
                {loadingTeam && (
                  <div className="px-4 py-10 text-center text-caption1 text-t-fg3">Chargement...</div>
                )}
                {!loadingTeam && teamEntries.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-t-fg-disabled opacity-40" />
                    <p className="text-caption1 text-t-fg3">Aucune candidature dans cette vue</p>
                  </div>
                )}
                {!loadingTeam && teamEntries.map((entry) => {
                  const cand = candidateByAppId.get(entry.application_id) ?? candidateByAppId.get(entry.candidate_id);
                  const firstName = cand?.first_name ?? '?';
                  const lastName  = cand?.last_name  ?? '';
                  const offerTitle = entry.offer_id ? offerTitleById.get(entry.offer_id) : undefined;
                  const active = entry.application_id === selectedId;
                  return (
                    <Link
                      key={entry.application_id}
                      to={`/candidates/${entry.application_id}`}
                      className={`flex items-center gap-3 px-3 py-3 border-l-[3px] transition-colors ${
                        active
                          ? 'bg-t-bg-subtle-selected border-l-t-stroke-brand'
                          : 'hover:bg-t-bg-subtle-hover border-l-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-t-brand-160 flex items-center justify-center text-caption2 font-semibold text-t-brand-80 shrink-0">
                        {firstName[0]}{lastName[0] ?? ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-body1 truncate ${active ? 'font-semibold' : ''} text-t-fg1`}>
                            {firstName} {lastName}
                          </span>
                          <span className="text-caption2 text-t-fg3 shrink-0">{timeAgo(entry.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${statusBadgeClass(entry.status)}`}>
                            {statusLabel(entry.status)}
                          </span>
                          {offerTitle && (
                            <span className="text-caption2 text-t-fg-disabled truncate max-w-[160px]">
                              {offerTitle.split(' ').slice(0, 3).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          <div className="px-3 py-2 border-t border-t-stroke3 text-caption2 text-t-fg3 shrink-0">
            {isEquipeMode
              ? `${teamEntries.length} candidature${teamEntries.length !== 1 ? 's' : ''}`
              : `${filtered.length} candidat${filtered.length !== 1 ? 's' : ''}`
            }
          </div>
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

