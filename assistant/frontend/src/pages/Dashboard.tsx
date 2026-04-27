import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Star,
  XCircle,
  Bot,
  CalendarDays,
  UserCheck,
  ChevronRight,
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

  return (
    <>
      <TopBar title="Activite" subtitle="Pilotage quotidien du recrutement" />
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

          {!loading && !error && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
                <p className="text-caption1 text-t-fg3">Candidats</p>
                <p className="text-subtitle2 font-semibold text-t-fg1">{candidates.length}</p>
              </div>
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
                <p className="text-caption1 text-t-fg3">Offres actives</p>
                <p className="text-subtitle2 font-semibold text-t-fg1">{activeOffers.length}</p>
              </div>
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
                <p className="text-caption1 text-t-fg3">Prioritaires</p>
                <p className="text-subtitle2 font-semibold text-t-fg1">
                  {candidates.filter((c) => c.tri_category === 'prioritaire').length}
                </p>
              </div>
            </section>
          )}

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
              <CalendarDays className="w-3.5 h-3.5" /> Gerer l'equipe
            </Link>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Offres actives</h2>
              <Link to="/offers" className="text-caption1 text-t-fg-brand hover:underline inline-flex items-center gap-0.5">
                Tout voir <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent divide-y divide-t-stroke3">
              {activeOffers.slice(0, 5).map((offer) => (
                <Link key={offer.id} to="/offers" className="flex items-center justify-between px-4 py-3 hover:bg-t-bg1-hover transition-colors">
                  <div>
                    <p className="text-body1 text-t-fg1 font-medium">{offer.title}</p>
                    <p className="text-caption2 text-t-fg3">{offer.candidates_count} candidats</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-t-fg3" />
                </Link>
              ))}
              {activeOffers.length === 0 && (
                <div className="px-4 py-6 text-caption1 text-t-fg3">Aucune offre active.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
