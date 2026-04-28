import React, { useEffect, useState } from 'react';
import { loadApplicationActivities } from '../../lib/domainApi';
import type { ApplicationActivity, ApplicationEventType } from '../../types';

// ─── Config visuelle par type d'événement ────────────────────────────────────

const EVENT_CONFIG: Record<ApplicationEventType, { label: string; icon: string; color: string }> = {
  STATUS_CHANGED:      { label: 'Statut modifié',          icon: '🔄', color: 'bg-blue-100 text-blue-700' },
  COMMENT_ADDED:       { label: 'Commentaire ajouté',       icon: '💬', color: 'bg-gray-100 text-gray-700' },
  TASK_CREATED:        { label: 'Tâche créée',              icon: '📋', color: 'bg-yellow-100 text-yellow-700' },
  TASK_DONE:           { label: 'Tâche terminée',           icon: '✅', color: 'bg-green-100 text-green-700' },
  INTERVIEW_SCHEDULED: { label: 'Entretien planifié',       icon: '📅', color: 'bg-purple-100 text-purple-700' },
  DOCUMENT_ADDED:      { label: 'Document ajouté',          icon: '📎', color: 'bg-orange-100 text-orange-700' },
  DECISION_RECORDED:   { label: 'Décision enregistrée',     icon: '⚖️', color: 'bg-red-100 text-red-700' },
  MENTION_TRIGGERED:   { label: 'Mention',                  icon: '@',  color: 'bg-indigo-100 text-indigo-700' },
  CHATBOT_COMPLETED:   { label: 'Chatbot complété',         icon: '🤖', color: 'bg-teal-100 text-teal-700' },
  AI_ANALYSIS_DONE:    { label: 'Analyse IA terminée',      icon: '🧠', color: 'bg-violet-100 text-violet-700' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildDescription(activity: ApplicationActivity): string {
  const p = activity.payload;
  switch (activity.event_type) {
    case 'STATUS_CHANGED':
      if (p.from && p.to) return `${p.from} → ${p.to}`;
      if (p.label) return String(p.label);
      return p.to ? `Nouveau statut : ${p.to}` : '';
    case 'COMMENT_ADDED':
      return p.preview ? String(p.preview) : '';
    case 'TASK_CREATED':
      return p.title ? `"${p.title}"` : '';
    case 'TASK_DONE':
      return p.title ? `"${p.title}" terminée` : '';
    case 'AI_ANALYSIS_DONE':
      return p.tri_category ? `Catégorie : ${p.tri_category}` : '';
    case 'DECISION_RECORDED':
      return p.final_status ? `Décision : ${p.final_status}` : '';
    default:
      return '';
  }
}

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  applicationId: string;
}

export default function ActivityTimeline({ applicationId }: Props) {
  const [activities, setActivities] = useState<ApplicationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadApplicationActivities(applicationId)
      .then(setActivities)
      .catch(() => setError('Impossible de charger la timeline'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
        <span className="animate-spin">⏳</span> Chargement de la timeline…
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-sm text-red-500">{error}</p>;
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Aucune activité pour le moment.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" aria-hidden />

      <ol className="space-y-4">
        {activities.map((activity) => {
          const config = EVENT_CONFIG[activity.event_type] ?? {
            label: activity.event_type,
            icon: '•',
            color: 'bg-gray-100 text-gray-600',
          };
          const description = buildDescription(activity);

          return (
            <li key={activity.id} className="flex gap-4 relative">
              {/* Icône */}
              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${config.color}`}
                title={config.label}
              >
                {config.icon}
              </span>

              {/* Contenu */}
              <div className="flex-1 min-w-0 pt-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800">{config.label}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(activity.created_at)}</span>
                </div>

                {description && (
                  <p className="mt-0.5 text-sm text-gray-500 truncate">{description}</p>
                )}

                {activity.actor_type !== 'SYSTEM' && activity.actor_id && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    Par {activity.actor_type === 'RECRUITER' ? 'recruteur' : 'utilisateur'} · {activity.actor_id.slice(0, 8)}…
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
