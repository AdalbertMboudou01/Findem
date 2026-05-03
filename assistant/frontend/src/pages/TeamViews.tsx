import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  Users,
  Activity,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { loadTeamView, loadRecruitmentData } from '../lib/domainApi';
import type { TeamViewEntry, TeamViewKey } from '../lib/domainApi';
import type { Offer, Candidate } from '../types';

type Tab = {
  key: TeamViewKey;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const TABS: Tab[] = [
  {
    key: 'attente_avis',
    label: "Attente d'avis",
    icon: <Clock className="w-4 h-4" />,
    description: 'Candidatures en attente d\'au moins un avis',
  },
  {
    key: 'pret_a_decider',
    label: 'Prêt à décider',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Tous les avis sont présents, décision finale manquante',
  },
  {
    key: 'attente_candidat',
    label: 'Attente candidat',
    icon: <Users className="w-4 h-4" />,
    description: 'Candidatures avec une tâche ouverte côté candidat',
  },
  {
    key: 'activite_offre',
    label: "Activité offre",
    icon: <Activity className="w-4 h-4" />,
    description: 'Toutes les candidatures actives de cette offre',
  },
];

const STATUS_COLORS: Record<string, string> = {
  en_cours: 'bg-blue-100 text-blue-800',
  retenu: 'bg-green-100 text-green-800',
  refuse: 'bg-red-100 text-red-800',
  en_attente: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-700',
};

function statusBadge(status: string) {
  const cls = STATUS_COLORS[status] ?? STATUS_COLORS.default;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function TeamViews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TeamViewKey>('attente_avis');
  const [entries, setEntries] = useState<TeamViewEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');

  // Load offers and candidates once for display enrichment
  useEffect(() => {
    loadRecruitmentData()
      .then(({ offers: o, candidates: c }) => {
        setOffers(o);
        setCandidates(c);
        if (o.length > 0) setSelectedOfferId(o[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedOfferId]);

  async function fetchView() {
    setLoading(true);
    setError(null);
    try {
      const offerId = activeTab === 'activite_offre' && selectedOfferId ? selectedOfferId : undefined;
      const data = await loadTeamView(activeTab, offerId);
      setEntries(data);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }

  function getCandidateName(candidateId: string) {
    const c = candidates.find((c) => c.id === candidateId);
    if (!c) return `Candidat ${candidateId.slice(0, 8)}…`;
    return `${c.first_name} ${c.last_name}`.trim() || c.email;
  }

  function getOfferTitle(offerId: string | null) {
    if (!offerId) return '—';
    const o = offers.find((o) => o.id === offerId);
    return o?.title ?? offerId.slice(0, 8) + '…';
  }

  function getCandidateApplicationId(candidateId: string) {
    const c = candidates.find((c) => c.id === candidateId);
    return c?.application_id ?? null;
  }

  function handleRowClick(entry: TeamViewEntry) {
    const appId = entry.application_id || getCandidateApplicationId(entry.candidate_id);
    if (appId) navigate(`/candidates/${appId}`);
  }

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vues d'équipe</h1>
        <p className="text-sm text-gray-500 mt-1">
          Suivez les candidatures selon leur état de coordination
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offer selector for activite_offre */}
      {activeTab === 'activite_offre' && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Offre :</label>
          <select
            value={selectedOfferId}
            onChange={(e) => setSelectedOfferId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">{currentTab.description}</p>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune candidature dans cette vue</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Candidat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Offre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Candidature</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr
                  key={entry.application_id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(entry)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {getCandidateName(entry.candidate_id)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getOfferTitle(entry.offer_id)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(entry.status)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                    {entry.application_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {entries.length} candidature{entries.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
