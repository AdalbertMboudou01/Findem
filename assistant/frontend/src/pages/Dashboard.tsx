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
import type { Offer, Candidate, InAppNotification } from '../types';
import { loadRecruitmentData, loadOverdueTasks, loadTeamView, loadMyInAppNotifications, markInAppNotificationAsRead, markAllInAppNotificationsAsRead } from '../lib/domainApi';

type MappedTask = Awaited<ReturnType<typeof loadOverdueTasks>>[number];
type AvisEntry = { application_id: string; candidate_name: string; status: string; created_at: string; };

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
  const [awaitingAvis, setAwaitingAvis] = useState<AvisEntry[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingAvis, setLoadingAvis] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Chargement offres + compteurs + join pour "attente avis" + nouvelles candidatures
    (async () => {
      try {
        const [data, avisEntries] = await Promise.all([
          loadRecruitmentData(),
          loadTeamView('attente_avis'),
        ]);
        if (!mounted) return;

        const candidateMap = new Map<string, Candidate>(
          data.candidates.map((c) => [c.application_id ?? '', c])
        );

        setOffers(data.offers.filter((o) => o.status === 'ouvert'));
        setCandidatesCount(data.candidates.length);

        // Nouvelles candidatures : < 48h, triées du plus récent
        const cutoff48h = Date.now() - 48 * 60 * 60 * 1000;
        setRecentCandidates(
          [...data.candidates]
            .filter((c) => new Date(c.created_at).getTime() > cutoff48h)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );

        setAwaitingAvis(
          avisEntries.map((e) => {
            const c = candidateMap.get(e.application_id);
            return {
              application_id: e.application_id,
              candidate_name: c ? `${c.first_name} ${c.last_name}` : 'Candidat',
              status: e.status,
              created_at: e.created_at,
            };
          })
        );
      } catch { /* silencieux */ } finally {
        if (mounted) { setLoadingOffers(false); setLoadingAvis(false); }
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

    // Chargement notifications
    (async () => {
      try {
        const { notifications } = await loadMyInAppNotifications();
        if (!mounted) return;
        // On affiche les 5 premières (non lues en tête, puis lues)
        setNotifications(
          [...notifications]
            .sort((a, b) => {
              if (a.read !== b.read) return a.read ? 1 : -1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .slice(0, 5)
        );
      } catch { /* silencieux */ } finally {
        if (mounted) setLoadingNotifs(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  async function handleMarkRead(id: string) {
    await markInAppNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    await markAllInAppNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

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
                {loadingAvis
                  ? <span className="inline-block w-8 h-4 bg-t-bg4 rounded animate-pulse" />
                  : awaitingAvis.length
                }
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

              {/* Bloc B — Candidatures en attente de mon avis */}
              <div>
                <SectionHeader
                  icon={Clock}
                  title="En attente de mon avis"
                  count={awaitingAvis.length > 0 ? awaitingAvis.length : undefined}
                  linkTo="/candidates"
                  accentColor="text-t-warning"
                  badgeColor="bg-t-warning-bg"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {loadingAvis ? (
                    <ListSkeleton rows={3} />
                  ) : awaitingAvis.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="Tous les avis ont été donnés 👍" />
                  ) : (
                    <div className="divide-y divide-t-stroke3">
                      {awaitingAvis.slice(0, 5).map((entry) => (
                        <Link
                          key={entry.application_id}
                          to={`/candidates/${entry.application_id}`}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-t-bg1-hover transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-t-warning-bg flex items-center justify-center shrink-0 text-caption2 font-semibold text-t-warning">
                            {entry.candidate_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body1 text-t-fg1 truncate">{entry.candidate_name}</p>
                            <p className="text-caption2 text-t-fg3">Reçu {timeAgo(entry.created_at)}</p>
                          </div>
                          <span className="text-caption2 text-t-warning font-medium shrink-0">Avis requis</span>
                          <ChevronRight className="w-4 h-4 text-t-fg3 shrink-0" />
                        </Link>
                      ))}
                      {awaitingAvis.length > 5 && (
                        <div className="px-3 py-2 text-caption2 text-t-fg-brand text-center">
                          + {awaitingAvis.length - 5} autres candidatures en attente
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Colonne droite */}
            <div className="space-y-4">

              {/* Bloc C — Nouvelles candidatures < 48h */}
              <div>
                <SectionHeader
                  icon={Users}
                  title="Nouvelles candidatures"
                  count={recentCandidates.length > 0 ? recentCandidates.length : undefined}
                  linkTo="/candidates"
                  accentColor="text-t-brand-80"
                  badgeColor="bg-t-bg-brand-selected"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {loadingOffers ? (
                    <ListSkeleton rows={4} />
                  ) : recentCandidates.length === 0 ? (
                    <EmptyState icon={Users} message="Aucune candidature dans les 48 dernières heures" />
                  ) : (
                    <div className="divide-y divide-t-stroke3">
                      {recentCandidates.slice(0, 5).map((c) => (
                        <Link
                          key={c.id}
                          to={`/candidates/${c.application_id ?? c.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-t-bg1-hover transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-t-bg-brand-selected flex items-center justify-center text-caption2 font-semibold text-t-brand-80 shrink-0">
                            {c.first_name[0]}{c.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body1 text-t-fg1 truncate">{c.first_name} {c.last_name}</p>
                            <p className="text-caption2 text-t-fg3 truncate">{c.action_recommandee || 'Analyse en attente'}</p>
                          </div>
                          <span className="text-caption2 text-t-fg3 shrink-0">{timeAgo(c.created_at)}</span>
                          <ChevronRight className="w-4 h-4 text-t-fg3 shrink-0" />
                        </Link>
                      ))}
                      {recentCandidates.length > 5 && (
                        <div className="px-3 py-2 text-caption2 text-t-fg-brand text-center">
                          + {recentCandidates.length - 5} autres nouvelles candidatures
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bloc D — Notifications récentes */}
              <div>
                <SectionHeader
                  icon={Bell}
                  title="Notifications récentes"
                  count={notifications.filter((n) => !n.read).length || undefined}
                  accentColor="text-t-fg2"
                  badgeColor="bg-t-bg4"
                />
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
                  {loadingNotifs ? (
                    <ListSkeleton rows={3} />
                  ) : notifications.length === 0 ? (
                    <EmptyState icon={CheckCircle2} message="Aucune notification récente" />
                  ) : (
                    <>
                      <div className="divide-y divide-t-stroke3">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 px-3 py-2.5 transition-colors ${
                              notif.read ? 'opacity-60' : 'bg-t-bg-brand-selected/30'
                            }`}
                          >
                            {/* Indicateur non-lu */}
                            <div className="mt-1.5 shrink-0">
                              {!notif.read
                                ? <span className="w-2 h-2 rounded-full bg-t-brand-80 block" />
                                : <span className="w-2 h-2 rounded-full bg-t-stroke3 block" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-body1 text-t-fg1 leading-snug truncate">{notif.title}</p>
                              {notif.message && (
                                <p className="text-caption2 text-t-fg3 truncate">{notif.message}</p>
                              )}
                              <p className="text-caption2 text-t-fg3 mt-0.5">{timeAgo(notif.created_at)}</p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="text-caption2 text-t-fg-brand hover:underline shrink-0 mt-0.5"
                                title="Marquer comme lu"
                              >
                                Lu
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {notifications.some((n) => !n.read) && (
                        <div className="px-3 py-2 border-t border-t-stroke3">
                          <button
                            onClick={handleMarkAllRead}
                            className="text-caption2 text-t-fg-brand hover:underline w-full text-center"
                          >
                            Tout marquer comme lu
                          </button>
                        </div>
                      )}
                    </>
                  )}
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
