import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Lock, Globe } from 'lucide-react';
import {
  createApplicationComment,
  deleteApplicationComment,
  loadApplicationComments,
} from '../../lib/domainApi';
import type { ApplicationComment } from '../../types';

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

/** Rend le corps d'un commentaire en mettant en évidence les @uuid */
function renderBody(body: string) {
  const parts = body.split(/(@[0-9a-fA-F-]{36})/g);
  return parts.map((part, i) =>
    /^@[0-9a-fA-F-]{36}$/.test(part) ? (
      <span key={i} className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  applicationId: string;
  /** ID de l'utilisateur courant, pour distinguer ses propres commentaires */
  currentUserId?: string | null;
}

export default function CommentsSection({ applicationId, currentUserId }: Props) {
  const [comments, setComments] = useState<ApplicationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'INTERNAL' | 'SHARED'>('INTERNAL');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Chargement ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    loadApplicationComments(applicationId)
      .then(setComments)
      .catch(() => setError('Impossible de charger les commentaires'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  // ─── Soumission ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createApplicationComment(applicationId, body.trim(), { visibility });
      setComments((prev) => [...prev, created]);
      setBody('');
    } catch {
      setSubmitError('Impossible d\'envoyer le commentaire. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Suppression ───────────────────────────────────────────────────────────
  async function handleDelete(commentId: string) {
    try {
      await deleteApplicationComment(applicationId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silent — on pourrait afficher une toast ici
    }
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4 space-y-3">
        <h3 className="text-caption1 font-semibold text-t-fg2">Ajouter un commentaire</h3>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Écrivez un commentaire interne… Mentionnez un collègue avec @son-uuid"
          className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
        />

        <div className="flex items-center justify-between gap-3">
          {/* Toggle visibilité */}
          <div className="flex items-center gap-1 rounded-fluent border border-t-stroke2 overflow-hidden">
            <button
              type="button"
              onClick={() => setVisibility('INTERNAL')}
              className={`flex items-center gap-1 px-3 py-1.5 text-caption2 transition-colors ${
                visibility === 'INTERNAL'
                  ? 'bg-t-bg3 text-t-fg1 font-semibold'
                  : 'text-t-fg3 hover:bg-t-bg2'
              }`}
            >
              <Lock className="w-3 h-3" /> Interne
            </button>
            <button
              type="button"
              onClick={() => setVisibility('SHARED')}
              className={`flex items-center gap-1 px-3 py-1.5 text-caption2 transition-colors ${
                visibility === 'SHARED'
                  ? 'bg-t-bg3 text-t-fg1 font-semibold'
                  : 'text-t-fg3 hover:bg-t-bg2'
              }`}
            >
              <Globe className="w-3 h-3" /> Partagé
            </button>
          </div>

          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="h-8 px-4 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent inline-flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>

        {submitError && (
          <p className="text-caption2 text-t-danger">{submitError}</p>
        )}
      </form>

      {/* ── Liste ── */}
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      {loading ? (
        <div className="py-6 text-center text-sm text-gray-400">Chargement des commentaires…</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Aucun commentaire pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isMine = currentUserId && comment.author_id === currentUserId;
            return (
              <div
                key={comment.id}
                className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Méta auteur */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-t-bg4 text-t-fg2 text-caption2 font-semibold flex items-center justify-center shrink-0">
                      {comment.author_type === 'RECRUITER' ? 'R' : 'U'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-caption1 font-semibold text-t-fg1 truncate block">
                        {comment.author_type === 'RECRUITER' ? 'Recruteur' : 'Utilisateur'}
                      </span>
                      <span className="text-caption2 text-t-fg3">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Badges + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {comment.visibility === 'INTERNAL' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption2 bg-gray-100 text-gray-500">
                        <Lock className="w-2.5 h-2.5" /> Interne
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption2 bg-blue-50 text-blue-600">
                        <Globe className="w-2.5 h-2.5" /> Partagé
                      </span>
                    )}
                    {isMine && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-t-fg3 hover:text-t-danger transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Corps */}
                <p className="mt-3 text-body1 text-t-fg1 leading-relaxed whitespace-pre-wrap">
                  {renderBody(comment.body)}
                </p>

                {/* Mentions */}
                {comment.mentions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {comment.mentions.map((m) => (
                      <span key={m} className="px-1.5 py-0.5 rounded text-caption2 bg-indigo-50 text-indigo-600">
                        @{m.slice(0, 8)}…
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
