import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Star,
  Eye,
  Clock,
  XCircle,
  Archive,
  ChevronRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Bell,
  UserCheck,
  MapPin,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { TriBadge } from '../components/ui/Badge';
import { useEffect, useMemo, useState } from 'react';
import type { Candidate, Offer } from '../types';
import { loadRecruitmentData } from '../lib/domainApi';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'A l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const recentCandidates = useMemo(
    () => [...candidates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [candidates],
  );

  const activeOffers = useMemo(() => offers.filter((o) => o.status === 'ouvert'), [offers]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const completed = candidates.filter((c) => c.chatbot_completed).length;
    return {
      total,
      prioritaires: candidates.filter((c) => c.tri_category === 'prioritaire').length,
      a_examiner: candidates.filter((c) => c.tri_category === 'a_examiner').length,
      a_revoir: candidates.filter((c) => c.tri_category === 'a_revoir').length,
      a_ecarter: candidates.filter((c) => c.tri_category === 'a_ecarter').length,
      vivier: candidates.filter((c) => c.status === 'vivier').length,
      offres: activeOffers.length,
      entretiens: 0,
      completion: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [activeOffers.length, candidates]);

  const activityFeed = useMemo(() => {
    return recentCandidates.slice(0, 6).map((candidate) => {
      if (candidate.tri_category === 'prioritaire') {
        return {
          icon: Star,
          text: `${candidate.first_name} ${candidate.last_name} classe prioritaire`,
          time: timeAgo(candidate.created_at),
          accent: 'text-t-success',
        };
      }
      if (candidate.status === 'non_retenu') {
        return {
          icon: XCircle,
          text: `${candidate.first_name} ${candidate.last_name} classe non retenu`,
          time: timeAgo(candidate.created_at),
          accent: 'text-t-danger',
        };
      }
      if (candidate.status === 'retenu_entretien') {
        return {
          icon: UserCheck,
          text: `${candidate.first_name} ${candidate.last_name} retenu pour entretien`,
          time: timeAgo(candidate.created_at),
          accent: 'text-t-success',
        };
      }

      return {
        icon: Bot,
        text: `Nouvelle candidature: ${candidate.first_name} ${candidate.last_name}`,
        time: timeAgo(candidate.created_at),
        accent: 'text-t-brand-80',
      };
    });
  }, [recentCandidates]);

  const totalCandidates = stats.total;

  return (
    <>
      <TopBar title="Activite" />
      <div className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="px-4 md:px-6 py-4 md:py-5 space-y-4">
          {loading && (
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">
              Chargement des donnees...
            </div>
          )}
          {!loading && error && (
            <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">
              {error}
            </div>
          )}

          {/* Row 1: KPI strip */}
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
            {/* Primary KPI */}
            <div className="bg-t-bg-brand rounded-fluent-lg px-5 py-4 flex flex-col justify-center">
              <span className="text-caption1 text-white/70">Total candidats</span>
              <span className="text-title3 font-semibold text-white">{stats.total}</span>
              <span className="text-caption2 text-white/60 mt-0.5">{stats.completion}% taux completion</span>
            </div>
            {/* Secondary KPIs */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: 'Prioritaires', value: stats.prioritaires, icon: Star, accent: 'text-t-success', bg: 'bg-t-success-bg', pct: stats.prioritaires / totalCandidates },
                { label: 'A examiner', value: stats.a_examiner, icon: Eye, accent: 'text-t-brand-80', bg: 'bg-t-bg-brand-selected', pct: stats.a_examiner / totalCandidates },
                { label: 'A revoir', value: stats.a_revoir, icon: Clock, accent: 'text-t-warning', bg: 'bg-t-warning-bg', pct: stats.a_revoir / totalCandidates },
                { label: 'Ecartes', value: stats.a_ecarter, icon: XCircle, accent: 'text-t-danger', bg: 'bg-t-danger-bg', pct: stats.a_ecarter / totalCandidates },
                { label: 'Vivier', value: stats.vivier, icon: Archive, accent: 'text-t-brand-80', bg: 'bg-t-bg-brand-selected', pct: stats.vivier / totalCandidates },
                { label: 'Entretiens', value: stats.entretiens, icon: CalendarDays, accent: 'text-t-fg1', bg: 'bg-t-bg3', pct: 0 },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-3 py-2.5 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <kpi.icon className={`w-3.5 h-3.5 ${kpi.accent}`} strokeWidth={1.5} />
                    <span className={`text-subtitle2 font-semibold ${kpi.accent}`}>{kpi.value}</span>
                  </div>
                  <span className="text-caption2 text-t-fg3">{kpi.label}</span>
                  {kpi.pct > 0 && (
                    <div className="mt-1.5 h-1 bg-t-bg4 rounded-full overflow-hidden">
                      <div className="h-full rounded-full opacity-80" style={{ width: `${Math.round(kpi.pct * 100)}%`, backgroundColor: kpi.accent === 'text-t-success' ? '#2E7D32' : kpi.accent === 'text-t-danger' ? '#C62828' : kpi.accent === 'text-t-warning' ? '#E6A817' : '#2B5EA7' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/offers" className="h-8 px-3 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors">
              <Briefcase className="w-3.5 h-3.5" /> Creer une offre
            </Link>
            <Link to="/candidates" className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 bg-t-bg1 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors">
              <Users className="w-3.5 h-3.5" /> Voir les candidats
            </Link>
            <Link to="/chatbot" className="hidden sm:inline-flex h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 bg-t-bg1 hover:bg-t-bg1-hover rounded-fluent items-center gap-1.5 transition-colors">
              <Bot className="w-3.5 h-3.5" /> Configurer le chatbot
            </Link>
            <Link to="/entreprise" className="hidden sm:inline-flex h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 bg-t-bg1 hover:bg-t-bg1-hover rounded-fluent items-center gap-1.5 transition-colors">
              <CalendarDays className="w-3.5 h-3.5" /> Planifier un entretien
            </Link>
            <div className="flex-1" />
            <span className="hidden md:inline text-caption2 text-t-fg3">{activeOffers.length} offres actives  --  {stats.entretiens} entretiens a venir</span>
          </div>

          {/* Row 2: Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Column 1: Recent candidates */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Candidatures recentes</h2>
                <Link to="/candidates" className="text-caption1 text-t-fg-brand hover:underline inline-flex items-center gap-0.5">
                  Tout <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden flex-1">
                {recentCandidates.map((c, i) => (
                  <Link
                    key={c.id}
                    to={`/candidates/${c.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 hover:bg-t-bg-subtle-hover transition-colors ${
                      i < recentCandidates.length - 1 ? 'border-b border-t-stroke3' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-t-brand-160 flex items-center justify-center text-caption2 font-semibold text-t-brand-80 shrink-0">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body1 text-t-fg1 truncate">{c.first_name} {c.last_name}</p>
                      <TriBadge category={c.tri_category} />
                    </div>
                    <span className="text-caption2 text-t-fg3 shrink-0">{timeAgo(c.created_at)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Activity feed */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Fil d'activite</h2>
                <Bell className="w-3.5 h-3.5 text-t-fg3" />
              </div>
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden flex-1">
                {activityFeed.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-3 py-2.5 ${
                      i < activityFeed.length - 1 ? 'border-b border-t-stroke3' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.accent === 'text-t-success' ? 'bg-t-success-bg' :
                      item.accent === 'text-t-danger' ? 'bg-t-danger-bg' :
                      item.accent === 'text-t-brand-80' ? 'bg-t-bg-brand-selected' : 'bg-t-bg4'
                    }`}>
                      <item.icon className={`w-3 h-3 ${item.accent}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption1 text-t-fg1 leading-snug">{item.text}</p>
                      <span className="text-caption2 text-t-fg3">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Interviews + Announcements stacked */}
            <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
              {/* Upcoming interviews */}
              <div>
                <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-2">Prochains entretiens</h2>
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-3 py-6 text-center text-caption1 text-t-fg3">
                  Aucun entretien disponible (pas encore de donnees API pour cet ecran).
                </div>
              </div>

              {/* Announcements */}
              <div>
                <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-2">Annonces</h2>
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-3 py-6 text-center text-caption1 text-t-fg3">
                  Aucune annonce disponible (pas encore de donnees API pour cet ecran).
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Active offers as horizontal cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Offres actives</h2>
              <Link to="/offers" className="text-caption1 text-t-fg-brand hover:underline inline-flex items-center gap-0.5">
                Tout voir <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {offers.filter((o) => o.status !== 'cloture').map((o) => (
                <Link key={o.id} to="/offers" className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-body1 font-semibold text-t-fg1 group-hover:text-t-fg-brand transition-colors truncate pr-2">{o.title}</p>
                    <ArrowUpRight className="w-3 h-3 text-t-fg-disabled group-hover:text-t-fg-brand transition-colors shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 text-caption2 text-t-fg3">
                    <MapPin className="w-3 h-3" />{o.location}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-caption2 text-t-fg3">{o.candidates_count} candidats</span>
                    <span className={`px-1.5 py-px text-caption2 font-medium rounded-sm ${
                      o.status === 'ouvert' ? 'bg-t-success-bg text-t-success' : 'bg-t-warning-bg text-t-warning'
                    }`}>
                      {o.status === 'ouvert' ? 'Ouvert' : 'En pause'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
