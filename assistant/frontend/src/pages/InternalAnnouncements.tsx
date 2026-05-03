import { useState, useEffect } from 'react';
import { Plus, Bell, Filter, Trash2, Eye, AlertCircle, Calendar, Users } from 'lucide-react';
import TopBar from '../components/layout/TopBar';

type Announcement = {
  announcementId: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  readCount: number;
  author: {
    name: string;
  };
};

const CATEGORY_CONFIG = {
  GENERAL: { label: 'Général', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  HIRING: { label: 'Recrutement', color: 'bg-green-50 text-green-600 border-green-200' },
  EVENT: { label: 'Événement', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  POLICY: { label: 'Politique', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  UPDATE: { label: 'Mise à jour', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
} as const;

const PRIORITY_CONFIG = {
  LOW: { label: 'Faible', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-600' },
  HIGH: { label: 'Élevé', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
} as const;

export default function InternalAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Formulaire de création
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    targetAudience: 'ALL',
    expiresAt: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const response = await fetch('/api/internal-announcements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        setError('Erreur lors du chargement des annonces');
      }
    } catch {
      setError('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/internal-announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        })
      });

      if (response.ok) {
        await loadAnnouncements();
        setShowCreateForm(false);
        setFormData({
          title: '',
          content: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
          targetAudience: 'ALL',
          expiresAt: '',
        });
      } else {
        setError('Erreur lors de la création de l\'annonce');
      }
    } catch {
      setError('Erreur lors de la création de l\'annonce');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(announcementId: string) {
    try {
      const response = await fetch(`/api/internal-announcements/${announcementId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        }
      });

      if (response.ok) {
        await loadAnnouncements();
      } else {
        setError('Erreur lors de la désactivation');
      }
    } catch {
      setError('Erreur lors de la désactivation');
    }
  }

  async function handleMarkAsRead(announcementId: string) {
    try {
      await fetch(`/api/internal-announcements/${announcementId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        }
      });
      await loadAnnouncements();
    } catch {
      // Silently fail
    }
  }

  const filteredAnnouncements = announcements.filter(ann => {
    if (filterCategory !== 'ALL' && ann.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && ann.priority !== filterPriority) return false;
    return true;
  });

  return (
    <>
      <TopBar title="Annonces internes" subtitle="Communication interne de l'entreprise" />
      <div className="flex-1 overflow-y-auto bg-t-bg3 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header avec filtres et création */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 text-caption1 bg-t-bg1 border border-t-stroke2 rounded-fluent appearance-none focus:outline-none focus:ring-2 focus:ring-t-stroke-brand"
                >
                  <option value="ALL">Toutes catégories</option>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="pl-10 pr-8 py-2 text-caption1 bg-t-bg1 border border-t-stroke2 rounded-fluent appearance-none focus:outline-none focus:ring-2 focus:ring-t-stroke-brand"
                >
                  <option value="ALL">Toutes priorités</option>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Nouvelle annonce
            </button>
          </div>

          {/* Formulaire de création */}
          {showCreateForm && (
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-t-stroke3 flex items-center justify-between">
                <h3 className="text-caption1 font-semibold text-t-fg1">Créer une annonce</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-t-fg3 hover:text-t-fg1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="px-5 py-4 space-y-4">
                {error && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-fluent text-caption1 text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Titre</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Titre de l'annonce"
                    required
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Contenu</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand resize-none"
                    placeholder="Contenu de l'annonce..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-caption1 font-medium text-t-fg2 mb-2">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand"
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption1 font-medium text-t-fg2 mb-2">Priorité</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand"
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption1 font-medium text-t-fg2 mb-2">Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand"
                    >
                      <option value="ALL">Tous</option>
                      <option value="RECRUITERS">Recruteurs</option>
                      <option value="MANAGEMENT">Management</option>
                      <option value="TECHNICAL">Technique</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Date d'expiration (optionnel)</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Création...' : 'Créer l\'annonce'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des annonces */}
          {loading ? (
            <div className="text-center py-8 text-caption1 text-t-fg3">Chargement...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-t-fg3 mx-auto mb-4" />
              <p className="text-caption1 text-t-fg3">Aucune annonce trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.announcementId}
                  className={`bg-t-bg1 border rounded-fluent-lg overflow-hidden ${
                    announcement.priority === 'URGENT' ? 'border-red-300' : 'border-t-stroke3'
                  }`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-body1 font-semibold text-t-fg1">{announcement.title}</h3>
                          <span className={`px-2 py-0.5 text-caption2 rounded border ${CATEGORY_CONFIG[announcement.category as keyof typeof CATEGORY_CONFIG]?.color}`}>
                            {CATEGORY_CONFIG[announcement.category as keyof typeof CATEGORY_CONFIG]?.label}
                          </span>
                          <span className={`px-2 py-0.5 text-caption2 rounded ${PRIORITY_CONFIG[announcement.priority as keyof typeof PRIORITY_CONFIG]?.color}`}>
                            {PRIORITY_CONFIG[announcement.priority as keyof typeof PRIORITY_CONFIG]?.label}
                          </span>
                        </div>

                        <p className="text-body2 text-t-fg2 mb-3">{announcement.content}</p>

                        <div className="flex items-center gap-4 text-caption2 text-t-fg3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {announcement.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {announcement.readCount} lectures
                          </span>
                          {announcement.expiresAt && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Expire: {new Date(announcement.expiresAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkAsRead(announcement.announcementId)}
                          className="p-2 text-t-fg3 hover:text-t-fg1 hover:bg-t-bg2 rounded-fluent"
                          title="Marquer comme lu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {announcement.isActive && (
                          <button
                            onClick={() => handleDeactivate(announcement.announcementId)}
                            className="p-2 text-t-fg3 hover:text-red-600 hover:bg-red-50 rounded-fluent"
                            title="Désactiver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
