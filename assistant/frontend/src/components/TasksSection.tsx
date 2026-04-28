import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2, ChevronDown } from 'lucide-react';
import {
  createApplicationTask,
  deleteApplicationTask,
  loadApplicationTasks,
  updateTaskStatus,
} from '../lib/domainApi';
import type { ApplicationTask } from '../types';

type Props = {
  applicationId: string;
};

const PRIORITY_LABEL: Record<ApplicationTask['priority'], string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

const PRIORITY_COLOR: Record<ApplicationTask['priority'], string> = {
  LOW: 'text-t-fg3',
  MEDIUM: 'text-t-brand-80',
  HIGH: 'text-amber-600',
  URGENT: 'text-t-danger',
};

const STATUS_ICON: Record<ApplicationTask['status'], React.ReactNode> = {
  TODO: <Clock className="w-4 h-4 text-t-fg3" />,
  IN_PROGRESS: <AlertCircle className="w-4 h-4 text-amber-500" />,
  DONE: <CheckCircle2 className="w-4 h-4 text-t-success" />,
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(d));
}

export default function TasksSection({ applicationId }: Props) {
  const [tasks, setTasks] = useState<ApplicationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<ApplicationTask['priority']>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadApplicationTasks(applicationId)
      .then((data) => { if (mounted) { setTasks(data); setLoading(false); } })
      .catch((err) => { if (mounted) { setError(err.message); setLoading(false); } });
    return () => { mounted = false; };
  }, [applicationId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await createApplicationTask(applicationId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer la tâche.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: ApplicationTask['status']) {
    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut.');
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await deleteApplicationTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer la tâche.');
    }
  }

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-caption1 font-semibold text-t-fg2">
          Tâches {tasks.length > 0 && <span className="text-t-fg3 font-normal">({tasks.length})</span>}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 text-caption1 font-medium text-t-brand-80 hover:text-t-brand-60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tâche…"
            className="w-full px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optionnel)…"
            className="w-full px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand resize-none transition-colors"
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
            />
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ApplicationTask['priority'])}
                className="appearance-none px-3 py-2 pr-8 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors cursor-pointer"
              >
                <option value="LOW">Priorité basse</option>
                <option value="MEDIUM">Priorité moyenne</option>
                <option value="HIGH">Priorité haute</option>
                <option value="URGENT">Urgent</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-fg3 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-caption1 text-t-fg2 hover:bg-t-bg1-hover rounded-fluent transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-3 py-1.5 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors"
            >
              {submitting ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-t-danger rounded-fluent">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-caption1 text-t-fg3">Chargement des tâches…</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-caption1 text-t-fg3">Aucune tâche pour cette candidature</div>
      ) : (
        <div className="space-y-2">
          {[...todoTasks, ...inProgressTasks, ...doneTasks].map((task) => (
            <div
              key={task.id}
              className={`bg-t-bg1 border rounded-fluent px-4 py-3 flex items-start gap-3 ${
                task.overdue ? 'border-t-danger' : 'border-t-stroke3'
              } ${task.status === 'DONE' ? 'opacity-60' : ''}`}
            >
              {/* Status toggle */}
              <button
                onClick={() => {
                  const next =
                    task.status === 'TODO' ? 'IN_PROGRESS'
                    : task.status === 'IN_PROGRESS' ? 'DONE'
                    : 'TODO';
                  handleStatusChange(task.id, next);
                }}
                title="Changer le statut"
                className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity"
              >
                {STATUS_ICON[task.status]}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-body1 font-medium ${task.status === 'DONE' ? 'line-through text-t-fg3' : 'text-t-fg1'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-caption2 text-t-fg3 mt-0.5 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-caption2 font-medium ${PRIORITY_COLOR[task.priority]}`}>
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                  {task.due_date && (
                    <span className={`text-caption2 ${task.overdue ? 'text-t-danger font-medium' : 'text-t-fg3'}`}>
                      {task.overdue ? '⚠ En retard — ' : ''}{formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(task.id)}
                className="shrink-0 p-1 rounded text-t-fg3 hover:text-t-danger hover:bg-t-danger-bg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
