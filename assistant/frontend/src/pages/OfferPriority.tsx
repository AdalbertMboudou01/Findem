import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Eye,
  Clock,
  XCircle,
  Github,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Users,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { TriBadge, StatusBadge } from '../components/ui/Badge';
import type { Candidate, Offer, TriCategory } from '../types';
import { loadRecruitmentData } from '../lib/domainApi';

const columns: { key: TriCategory; label: string; icon: typeof Star; color: string; bg: string; desc: string }[] = [
  {
    key: 'prioritaire',
    label: 'Prioritaires',
    icon: Star,
    color: 'text-t-success',
    bg: 'bg-t-success-bg',
    desc: 'Signaux forts, à traiter en premier',
  },
  {
    key: 'a_examiner',
    label: 'À examiner',
    icon: Eye,
    color: 'text-t-brand-80',
    bg: 'bg-t-brand-160',
    desc: 'Profils intéressants, attention requise',
  },
  {
    key: 'a_revoir',
    label: 'À revoir',
    icon: Clock,
    color: 'text-t-warning',
    bg: 'bg-t-warning-bg',
    desc: 'Signaux mitigés, à approfondir',
  },
  {
    key: 'a_ecarter',
    label: 'À écarter',
    icon: XCircle,
    color: 'text-t-danger',
    bg: 'bg-t-danger-bg',
    desc: 'Peu de correspondance avec le profil attendu',
  },
];

function CandidateCard({ candidate, offerId }: { candidate: Candidate; offerId: string }) {
  const initials = `${candidate.first_name?.[0] ?? ''}${candidate.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <Link
      to={`/candidates/${candidate.id}`}
      className="block bg-t-bg1 border border-t-stroke3 rounded-fluent hover:border-t-stroke2 hover:shadow-[0_1px_3px_rgba(0,0,0,0.07)] transition-all group"
    >
      <div className="px-3 py-3">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-t-brand-160 text-t-brand-80 flex items-center justify-center shrink-0 text-caption2 font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <p className="text-caption1 font-semibold text-t-fg1 truncate">
                {candidate.first_name} {candidate.last_name}
              </p>
              <ChevronRight className="w-3.5 h-3.5 text-t-fg3 group-hover:text-t-fg2 transition-colors shrink-0" />
            </div>
            <StatusBadge status={candidate.status} />
          </div>
        </div>

        {/* Motivation summary */}
        {candidate.motivation_summary && (
          <p className="mt-2 text-caption2 text-t-fg2 line-clamp-2 leading-relaxed">
            {candidate.motivation_summary}
          </p>
        )}

        {/* Signals */}
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          {candidate.chatbot_completed && (
            <span className="inline-flex items-center gap-1 text-caption2 text-t-success">
              <CheckCircle2 className="w-3 h-3" /> Chatbot terminé
            </span>
          )}
          {candidate.github_url && (
            <span className="inline-flex items-center gap-1 text-caption2 text-t-fg3">
              <Github className="w-3 h-3" /> GitHub
            </span>
          )}
          {candidate.portfolio_url && (
            <span className="inline-flex items-center gap-1 text-caption2 text-t-fg3">
              <Globe className="w-3 h-3" /> Portfolio
            </span>
          )}
          {candidate.points_attention.length > 0 && (
            <span className="inline-flex items-center gap-1 text-caption2 text-t-warning">
              <AlertTriangle className="w-3 h-3" /> {candidate.points_attention.length} point{candidate.points_attention.length > 1 ? 's' : ''} d'attention
            </span>
          )}
        </div>

        {/* Technologies */}
        {candidate.technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.technologies.slice(0, 4).map((t) => (
              <span key={t} className="px-1.5 py-px text-caption2 bg-t-bg3 text-t-fg2 rounded-sm">{t}</span>
            ))}
            {candidate.technologies.length > 4 && (
              <span className="px-1.5 py-px text-caption2 text-t-fg3">+{candidate.technologies.length - 4}</span>
            )}
          </div>
        )}

        {/* Recommended action */}
        {candidate.action_recommandee && (
          <p className="mt-2 text-caption2 text-t-fg3 italic line-clamp-1">{candidate.action_recommandee}</p>
        )}
      </div>
    </Link>
  );
}

function ColumnHeader({ col, count }: { col: typeof columns[number]; count: number }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-fluent ${col.bg} mb-3`}>
      <col.icon className={`w-4 h-4 ${col.color}`} strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <span className={`text-caption1 font-semibold ${col.color}`}>{col.label}</span>
        <span className="text-caption2 text-t-fg3 ml-2">{count}</span>
      </div>
    </div>
  );
}

export default function OfferPriority() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCol, setActiveCol] = useState<TriCategory | 'all'>('all');

  useEffect(() => {
    if (!offerId) return;
    (async () => {
      try {
        const data = await loadRecruitmentData();
        setOffer(data.offers.find((o) => o.id === offerId) ?? null);
        setCandidates(data.candidates.filter((c) => c.offer_id === offerId));
      } finally {
        setLoading(false);
      }
    })();
  }, [offerId]);

  const byCategory = (cat: TriCategory) => candidates.filter((c) => c.tri_category === cat);

  const completedCount = candidates.filter((c) => c.chatbot_completed).length;
  const completionRate = candidates.length > 0 ? Math.round((completedCount / candidates.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Priorisation" />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-caption1 text-t-fg3">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={offer ? `Priorisation — ${offer.title}` : 'Priorisation'}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/offers')}
              className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
            {offerId && (
              <Link
                to={`/offers/${offerId}/settings`}
                className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Paramètres
              </Link>
            )}
          </div>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 sm:px-6 py-3 bg-t-bg2 border-b border-t-stroke3 shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-t-fg3" strokeWidth={1.5} />
          <span className="text-caption1 text-t-fg3">{candidates.length} candidats</span>
        </div>
        {columns.map((col) => {
          const count = byCategory(col.key).length;
          return (
            <div key={col.key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${col.bg.replace('bg-', 'bg-').replace('-bg', '')}`}
                style={{ background: col.key === 'prioritaire' ? 'var(--color-t-success)' : col.key === 'a_examiner' ? 'var(--color-t-brand-80)' : col.key === 'a_revoir' ? 'var(--color-t-warning)' : 'var(--color-t-danger)' }}
              />
              <span className="text-caption1 text-t-fg2">{count} {col.label.toLowerCase()}</span>
            </div>
          );
        })}
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="w-20 h-1.5 bg-t-bg4 rounded-full overflow-hidden">
            <div className="h-full bg-t-brand-80 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
          <span className="text-caption2 text-t-fg3">{completionRate}% chatbot terminé</span>
        </div>
      </div>

      {/* Column filter (mobile) */}
      <div className="flex items-center border-b border-t-stroke2 bg-t-bg1 px-4 sm:px-6 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveCol('all')}
          className={`px-3 py-3 text-caption1 font-semibold border-b-2 transition-colors whitespace-nowrap mr-1 ${
            activeCol === 'all'
              ? 'border-t-stroke-brand text-t-fg-brand'
              : 'border-transparent text-t-fg3 hover:text-t-fg2'
          }`}
        >
          Tous <span className="text-caption2 text-t-fg3 ml-1">{candidates.length}</span>
        </button>
        {columns.map((col) => {
          const count = byCategory(col.key).length;
          return (
            <button
              key={col.key}
              onClick={() => setActiveCol(col.key)}
              className={`px-3 py-3 text-caption1 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeCol === col.key
                  ? 'border-t-stroke-brand text-t-fg-brand'
                  : 'border-transparent text-t-fg3 hover:text-t-fg2'
              }`}
            >
              {col.label} <span className="text-caption2 text-t-fg3 ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-t-bg3">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Users className="w-12 h-12 text-t-fg-disabled mb-3" strokeWidth={1} />
            <p className="text-body1 text-t-fg3">Aucun candidat pour cette offre</p>
            <p className="text-caption1 text-t-fg-disabled mt-1">
              Les candidatures arriveront via le lien chatbot de l'offre
            </p>
          </div>
        ) : (
          <div className="px-3 sm:px-6 py-5">
            {/* Desktop: 4 colonnes */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {columns.map((col) => {
                const items = byCategory(col.key);
                return (
                  <div key={col.key}>
                    <ColumnHeader col={col} count={items.length} />
                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <p className="text-caption2 text-t-fg-disabled text-center py-4">Aucun profil</p>
                      ) : (
                        items.map((c) => (
                          <CandidateCard key={c.id} candidate={c} offerId={offerId!} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile/Tablet: sections empilées filtrées */}
            <div className="lg:hidden space-y-6">
              {columns
                .filter((col) => activeCol === 'all' || activeCol === col.key)
                .map((col) => {
                  const items = byCategory(col.key);
                  if (activeCol !== 'all' && items.length === 0) {
                    return (
                      <div key={col.key}>
                        <ColumnHeader col={col} count={0} />
                        <p className="text-caption2 text-t-fg-disabled text-center py-4">Aucun profil</p>
                      </div>
                    );
                  }
                  if (activeCol === 'all' && items.length === 0) return null;
                  return (
                    <div key={col.key}>
                      <ColumnHeader col={col} count={items.length} />
                      <div className="space-y-2">
                        {items.map((c) => (
                          <CandidateCard key={c.id} candidate={c} offerId={offerId!} />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
