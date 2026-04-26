import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  Search,
  Users,
  ChevronRight,
  Github,
  Globe,
  Calendar,
  Briefcase,
  UserCheck,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { StatusBadge, TriBadge } from '../components/ui/Badge';
import type { Candidate, Offer } from '../types';
import { loadRecruitmentData, setCandidateDecision } from '../lib/domainApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Vivier() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [filterOffer, setFilterOffer] = useState<string>('all');
  const [filterTech, setFilterTech] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function refreshData(isFirst = false) {
    if (isFirst) setLoading(true);
    try {
      const data = await loadRecruitmentData();
      setOffers(data.offers);
      setCandidates(data.candidates.filter((c) => c.status === 'vivier'));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le vivier.');
    } finally {
      if (isFirst) setLoading(false);
    }
  }

  useEffect(() => { refreshData(true); }, []);

  // Toutes les technos présentes dans le vivier pour le filtre
  const allTechs = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => c.technologies.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch =
        !search ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchOffer = filterOffer === 'all' || c.offer_id === filterOffer;
      const matchTech = !filterTech || c.technologies.some((t) => t.toLowerCase() === filterTech.toLowerCase());
      return matchSearch && matchOffer && matchTech;
    });
  }, [candidates, search, filterOffer, filterTech]);

  async function handleReactivate(candidateId: string) {
    setActionError('');
    setActionLoading(candidateId);
    try {
      await setCandidateDecision(candidateId, 'a_revoir_manuellement');
      await refreshData(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible de réactiver le candidat.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEcarter(candidateId: string) {
    setActionError('');
    setActionLoading(candidateId);
    try {
      await setCandidateDecision(candidateId, 'non_retenu');
      await refreshData(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible d\'écarter le candidat.');
    } finally {
      setActionLoading(null);
    }
  }

  const getOfferTitle = (offerId: string | null) => {
    if (!offerId) return null;
    return offers.find((o) => o.id === offerId)?.title ?? null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Vivier"
        actions={
          <span className="text-caption1 text-t-fg3">
            {candidates.length} profil{candidates.length !== 1 ? 's' : ''} en réserve
          </span>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 sm:px-6 py-3 bg-t-bg2 border-b border-t-stroke3 shrink-0">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-t-fg3" strokeWidth={1.5} />
          <span className="text-caption1 text-t-fg2 font-medium">{candidates.length} profils en vivier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-t-brand-80" />
          <span className="text-caption1 text-t-fg3">
            {candidates.filter((c) => c.github_url).length} avec GitHub
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-t-success" />
          <span className="text-caption1 text-t-fg3">
            {candidates.filter((c) => c.chatbot_completed).length} chatbots terminés
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-t-fg-disabled" />
          <span className="text-caption1 text-t-fg3">
            {new Set(candidates.map((c) => c.offer_id).filter(Boolean)).size} offres représentées
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 bg-t-bg1 border-b border-t-stroke3 shrink-0">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-fg3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, techno…"
              className="h-8 w-full pl-8 pr-3 text-caption1 text-t-fg1 bg-t-bg2 border border-t-stroke2 rounded-fluent focus:outline-none focus:ring-1 focus:ring-t-brand-80 placeholder:text-t-fg3"
            />
          </div>

          {/* Filter by offer */}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-t-fg3" />
            <select
              value={filterOffer}
              onChange={(e) => setFilterOffer(e.target.value)}
              className="h-8 px-2 pr-6 text-caption1 text-t-fg2 bg-t-bg2 border border-t-stroke2 rounded-fluent focus:outline-none focus:ring-1 focus:ring-t-brand-80 appearance-none"
            >
              <option value="all">Toutes les offres</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>

          {/* Filter by tech */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-t-fg3" />
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="h-8 px-2 pr-6 text-caption1 text-t-fg2 bg-t-bg2 border border-t-stroke2 rounded-fluent focus:outline-none focus:ring-1 focus:ring-t-brand-80 appearance-none"
            >
              <option value="">Toutes les technos</option>
              {allTechs.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {(search || filterOffer !== 'all' || filterTech) && (
            <button
              onClick={() => { setSearch(''); setFilterOffer('all'); setFilterTech(''); }}
              className="h-8 px-3 text-caption1 text-t-fg3 hover:text-t-fg2 transition-colors"
            >
              Réinitialiser
            </button>
          )}

          <span className="text-caption2 text-t-fg3 sm:ml-auto">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[820px] mx-auto px-3 sm:px-6 py-5 space-y-2">
          {loading && (
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">
              Chargement du vivier…
            </div>
          )}
          {!loading && error && (
            <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
              {error}
            </div>
          )}
          {!loading && actionError && (
            <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
              {actionError}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Archive className="w-12 h-12 text-t-fg-disabled mb-3" strokeWidth={1} />
              <p className="text-body1 text-t-fg3">Le vivier est vide</p>
              <p className="text-caption1 text-t-fg-disabled mt-1">
                Les candidats placés en réserve apparaîtront ici
              </p>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-8 h-8 text-t-fg-disabled mb-2" strokeWidth={1} />
              <p className="text-body1 text-t-fg3">Aucun résultat</p>
              <p className="text-caption1 text-t-fg-disabled mt-1">Modifiez les filtres pour voir plus de profils</p>
            </div>
          )}

          {filtered.map((candidate) => {
            const offerTitle = getOfferTitle(candidate.offer_id);
            const initials = `${candidate.first_name?.[0] ?? ''}${candidate.last_name?.[0] ?? ''}`.toUpperCase();
            const busy = actionLoading === candidate.id;

            return (
              <div
                key={candidate.id}
                className="bg-t-bg1 border border-t-stroke3 rounded-fluent hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-t-brand-160 text-t-brand-80 flex items-center justify-center shrink-0 text-caption1 font-bold">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/candidates/${candidate.id}`}
                            className="text-body1 font-semibold text-t-fg1 hover:text-t-fg-brand hover:underline transition-colors"
                          >
                            {candidate.first_name} {candidate.last_name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={candidate.status} />
                            <TriBadge category={candidate.tri_category} />
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-t-fg3 shrink-0 mt-1" />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-caption1 text-t-fg3">
                        <span>{candidate.email}</span>
                        {offerTitle && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {offerTitle}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(candidate.created_at)}
                        </span>
                      </div>

                      {/* Summary */}
                      {candidate.motivation_summary && (
                        <p className="mt-2 text-caption1 text-t-fg2 line-clamp-2 leading-relaxed">
                          {candidate.motivation_summary}
                        </p>
                      )}

                      {/* Signals + techs */}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.technologies.slice(0, 5).map((t) => (
                            <span key={t} className="px-1.5 py-px text-caption2 bg-t-bg3 text-t-fg2 rounded-sm">{t}</span>
                          ))}
                          {candidate.technologies.length > 5 && (
                            <span className="text-caption2 text-t-fg3">+{candidate.technologies.length - 5}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-caption2 text-t-fg3">
                          {candidate.github_url && (
                            <a
                              href={candidate.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-t-fg1 transition-colors"
                            >
                              <Github className="w-3 h-3" /> GitHub
                            </a>
                          )}
                          {candidate.portfolio_url && (
                            <a
                              href={candidate.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:text-t-fg1 transition-colors"
                            >
                              <Globe className="w-3 h-3" /> Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-t-stroke3">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="h-7 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center gap-1.5 transition-colors"
                    >
                      Voir la fiche
                    </Link>
                    <button
                      disabled={busy}
                      onClick={() => handleReactivate(candidate.id)}
                      className="h-7 px-3 text-caption1 font-semibold text-t-success border border-t-success rounded-fluent hover:bg-t-success-bg inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      {busy ? '…' : 'Réactiver'}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleEcarter(candidate.id)}
                      className="h-7 px-3 text-caption1 font-semibold text-t-danger border border-t-danger rounded-fluent hover:bg-t-danger-bg inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {busy ? '…' : 'Écarter définitivement'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
