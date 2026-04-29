import { Link } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  AlertCircle,
  Clock,
  Users,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { useEffect, useState } from 'react';
import type { Offer } from '../types';
import { loadRecruitmentData, loadOverdueTasks } from '../lib/domainApi';

type MappedTask = Awaited<ReturnType<typeof loadOverdueTasks>>[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Titre de section avec lien optionnel */
function SectionHeader({
  icon: Icon,
  title,
  count,
  linkTo,
  linkLabel = 'Voir tout',
  accentColor = 'text-t-fg3',
  badgeColor = 'bg-t-bg4',
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  linkTo?: string;
  linkLabel?: string;
  accentColor?: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-fluent flex items-center justify-center ${badgeColor}`}>
          <Icon className={`w-3.5 h-3.5 ${accentColor}`} strokeWidth={2} />
        </div>
        <h2 className="text-caption1 font-semibold text-t-fg1">{title}</h2>
        {count !== undefined && (
          <span className="text-caption2 font-semibold text-t-fg3 bg-t-bg4 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {count}
          </span>
        )}
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-caption2 text-t-fg-brand hover:underline inline-flex items-center gap-0.5">
          {linkLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/** Skeleton de chargement pour une liste */
function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-t-stroke3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="w-7 h-7 rounded-full bg-t-bg4 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-t-bg4 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-t-bg4 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bloc vide générique */
function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-t-fg3">
      <Icon className="w-8 h-8 opacity-30" strokeWidth={1.2} />
      <p className="text-caption1">{message}</p>
    </div>
  );
}

/** Badge de priorité pour une tâche */
const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  LOW:    { label: 'Faible',  className: 'bg-t-bg4 text-t-fg3' },
  MEDIUM: { label: 'Moyen',   className: 'bg-t-warning-bg text-t-warning' },
  HIGH:   { label: 'Haute',   className: 'bg-t-danger-bg text-t-danger' },
  URGENT: { label: 'Urgent',  className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold' },
};

function PriorityBadge({ priority }: { priority: string }) {
  const s = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.LOW;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${s.className}`}>
      {s.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState<MappedTask[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Chargement offres + compteurs
    (async () => {
      try {
        const data = await loadRecruitmentData();
        if (!mounted) return;
        setOffers(data.offers.filter((o) => o.status === 'ouvert'));
        setCandidatesCount(data.candidates.length);
      } catch { /* silencieux */ } finally {
        if (mounted) setLoadingOffers(false);
      }
    })();
    // Chargement tâches en retard
    (async () => {
      try {
        const tasks = await loadOverdueTasks();
        if (!mounted) return;
        setOverdueTasks(tasks);
      } catch { /* silencieux */ } finally {
        if (mounted) setLoadingTasks(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <TopBar title="Accueil" subtitle="Ce qui nécessite votre attention aujourd'hui" />

      <div className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="px-4 md:px-6 py-4 md:py-5 space-y-5">

          {/* ── Barre d'actions rapides ── */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/offers"
              className="h-8 px-3 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" /> Nouvelle offre
            </Link>
            <Link
              to="/candidates"
              className="h-8 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 bg-t-bg1 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Candidatures
            </Link>
          </div>

          {/* ── Compteurs rapides ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
              <p className="text-caption2 text-t-fg3">Candidatures totales</p>
              <p className="text-subtitle2 font-semibold text-t-fg1 mt-0.5">
                {loadingOffers ? <span className="inline-block w-8 h-4 bg-t-bg4 rounded animate-pulse" /> : candidatesCount}
              </p>
            </div>
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
              <p className="text-caption2 text-t-fg3">Offres ouvertes</p>
              <p className="text-subtitle2 font-semibold text-t-fg1 mt-0.5">
                {loadingOffers ? <span className="inline-block w-8 h-4 bg-t-bg4 rounded animate-pulse" /> : offers.length}
              </p>
            </div>
            <div className="hidden sm:block bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
              <p className="text-caption2 text-t-fg3">En attente de décision</p>
              <p className="text-subtitle2 font-semibold text-t-fg1 mt-0.5">
                {/* Étape 3 — sera rempli dynamiquement */}
                <span className="inline-block w-8 h-4 bg-t-bg4 rounded animate-pulse" />
              </p>
            </div>
          </div>

          {/* ── Grille principale : 2 colonnes ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Colonne gauche */}
            <div className="space-y-4">

              {/* Bloc A — Tâches en retard */}
              <div>
                <SectionHeader
                  icon={AlertCircle}
                  title="Tâches en retard"
                  count={overdueTasks.length > 0 ? overdueTasks.length : undefined}
                  linkTo="/candidates"
                  linkLabel="Mes tâches"
                  accentColor="text-t-danger"
                  badgeColor="bg-t-danger-bg"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {loadingTasks ? (
                    <ListSkeleton rows={3} />
                  ) : overdueTasks.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="Aucune tâche en retard 🎉" />
                  ) : (
                    <div className="divide-y divide-t-stroke3">
                      {overdueTasks.slice(0, 5).map((task) => (
                        <Link
                          key={task.id}
                          to={`/candidates/${task.application_id}`}
                          className="flex items-start gap-3 px-3 py-2.5 hover:bg-t-bg1-hover transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-t-danger-bg flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-t-danger" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body1 text-t-fg1 truncate leading-snug">{task.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <PriorityBadge priority={task.priority} />
                              {task.due_date && (
                                <span className="text-caption2 text-t-danger">
                                  Échéance {timeAgo(task.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-t-fg3 shrink-0 mt-1" />
                        </Link>
                      ))}
                      {overdueTasks.length > 5 && (
                        <div className="px-3 py-2 text-caption2 text-t-fg-brand text-center">
                          + {overdueTasks.length - 5} autres tâches en retard
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bloc B — Candidatures en attente de mon avis (Étape 3) */}
              <div>
                <SectionHeader
                  icon={Clock}
                  title="En attente de mon avis"
                  linkTo="/candidates"
                  accentColor="text-t-warning"
                  badgeColor="bg-t-warning-bg"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {/* Étape 3 — données réelles */}
                  <ListSkeleton rows={3} />
                </div>
              </div>

            </div>

            {/* Colonne droite */}
            <div className="space-y-4">

              {/* Bloc C — Nouvelles candidatures < 48h (Étape 4) */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Nouvelles candidatures"
                  linkTo="/candidates"
                  accentColor="text-t-brand-80"
                  badgeColor="bg-t-bg-brand-selected"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {/* Étape 4 — données réelles */}
                  <ListSkeleton rows={4} />
                </div>
              </div>

              {/* Bloc D — Notifications récentes (Étape 5) */}
              <div>
                <SectionHeader
                  icon={Bell}
                  title="Notifications récentes"
                  accentColor="text-t-fg2"
                  badgeColor="bg-t-bg4"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {/* Étape 5 — données réelles */}
                  <EmptyState icon={CheckCircle2} message="Aucune notification récente" />
                </div>
              </div>

            </div>
          </div>

          {/* ── Offres actives (bas de page) ── */}
          {offers.length > 0 && (
            <div>
              <SectionHeader
                icon={Briefcase}
                title="Offres ouvertes"
                count={offers.length}
                linkTo="/offers"
                accentColor="text-t-fg3"
                badgeColor="bg-t-bg4"
              />
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent divide-y divide-t-stroke3">
                {offers.slice(0, 4).map((offer) => (
                  <Link
                    key={offer.id}
                    to="/offers"
                    className="flex items-center justify-between px-4 py-3 hover:bg-t-bg1-hover transition-colors"
                  >
                    <div>
                      <p className="text-body1 text-t-fg1 font-medium">{offer.title}</p>
                      <p className="text-caption2 text-t-fg3">{offer.candidates_count ?? 0} candidature{(offer.candidates_count ?? 0) > 1 ? 's' : ''}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-t-fg3 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export { timeAgo };
