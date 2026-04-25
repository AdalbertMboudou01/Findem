import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  MessageSquare,
  Megaphone,
  Archive,
  Users,
  Mail,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { TriBadge } from '../components/ui/Badge';
import { loadRecruitmentData } from '../lib/domainApi';
import type { Candidate, Offer } from '../types';

type Tab = 'entretiens' | 'discussions' | 'vivier' | 'annonces';

const tabConfig: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
  { key: 'entretiens', label: 'Entretiens', icon: CalendarDays },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare },
  { key: 'vivier', label: 'Vivier', icon: Archive },
  { key: 'annonces', label: 'Annonces', icon: Megaphone },
];

export default function Entreprise() {
  const [activeTab, setActiveTab] = useState<Tab>('entretiens');
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
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les donnees entreprise.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const vivierCandidates = useMemo(
    () => candidates.filter((c) => c.status === 'vivier'),
    [candidates],
  );

  const potentialVivier = useMemo(
    () => candidates.filter((c) => c.tri_category === 'a_revoir' && c.status !== 'vivier'),
    [candidates],
  );

  const counts = {
    entretiens: 0,
    discussions: 0,
    vivier: vivierCandidates.length,
    annonces: 0,
  };

  return (
    <>
      <TopBar title="Entreprise" />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="md:hidden flex items-center border-b border-t-stroke2 bg-t-bg2 px-2 shrink-0 overflow-x-auto">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-caption1 font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-t-stroke-brand text-t-fg-brand'
                  : 'border-transparent text-t-fg3 hover:text-t-fg2'
              }`}
            >
              <tab.icon className="w-4 h-4" strokeWidth={1.5} />
              {tab.label}
              <span className="text-caption2 text-t-fg3 ml-0.5">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex w-[220px] shrink-0 border-r border-t-stroke2 flex-col bg-t-bg2">
          <div className="px-4 py-3 border-b border-t-stroke3">
            <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Espace entreprise</h3>
          </div>
          <div className="flex-1 py-1">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-[3px] transition-colors ${
                  activeTab === tab.key
                    ? 'bg-t-bg-subtle-selected border-l-t-stroke-brand'
                    : 'hover:bg-t-bg-subtle-hover border-l-transparent'
                }`}
              >
                <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.key ? 'text-t-fg-brand' : 'text-t-fg3'}`} strokeWidth={1.5} />
                <span className={`text-body1 flex-1 text-left ${activeTab === tab.key ? 'font-semibold text-t-fg1' : 'text-t-fg2'}`}>{tab.label}</span>
                <span className={`text-caption2 px-1.5 py-px rounded-sm ${
                  activeTab === tab.key ? 'bg-t-brand-160 text-t-brand-80 font-medium' : 'text-t-fg3'
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-t-stroke3 space-y-2">
            <div className="flex items-center justify-between text-caption2">
              <span className="text-t-fg3">Profils en vivier</span>
              <span className="text-t-fg1 font-medium">{counts.vivier}</span>
            </div>
            <div className="flex items-center justify-between text-caption2">
              <span className="text-t-fg3">Offres ouvertes</span>
              <span className="text-t-fg1 font-medium">{offers.filter((o) => o.status === 'ouvert').length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-t-bg3">
          <div className="max-w-[840px] mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4">
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

            {!loading && !error && activeTab === 'entretiens' && (
              <EmptyPanel
                icon={CalendarDays}
                title="Entretiens"
                message="Aucune donnee reelle d'entretiens n'est encore branchee sur cet ecran."
              />
            )}

            {!loading && !error && activeTab === 'discussions' && (
              <EmptyPanel
                icon={MessageSquare}
                title="Discussions"
                message="Aucune donnee reelle de discussions internes n'est encore branchee sur cet ecran."
              />
            )}

            {!loading && !error && activeTab === 'annonces' && (
              <EmptyPanel
                icon={Megaphone}
                title="Annonces"
                message="Aucune donnee reelle d'annonces n'est encore branchee sur cet ecran."
              />
            )}

            {!loading && !error && activeTab === 'vivier' && (
              <>
                <div>
                  <h2 className="text-subtitle2 font-semibold text-t-fg1">Vivier de talents</h2>
                  <p className="text-caption1 text-t-fg3 mt-0.5">Profils reels conserves pour des opportunites futures</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <StatCard label="Dans le vivier" value={vivierCandidates.length} icon={Archive} />
                  <StatCard label="Transferables" value={potentialVivier.length} icon={Users} />
                  <StatCard label="Offres ouvertes" value={offers.filter((o) => o.status === 'ouvert').length} icon={Briefcase} />
                </div>

                {vivierCandidates.length === 0 ? (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-12 text-center">
                    <Archive className="w-10 h-10 text-t-fg-disabled mx-auto mb-3" strokeWidth={1} />
                    <p className="text-body1 text-t-fg2 mb-1">Le vivier est vide</p>
                    <p className="text-caption1 text-t-fg3">Placez des candidats dans le vivier depuis leur fiche candidat.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vivierCandidates.map((c) => {
                      const linkedOffer = offers.find((o) => o.id === c.offer_id);
                      return (
                        <div key={c.id} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-t-brand-160 flex items-center justify-center text-caption1 font-semibold text-t-brand-80 shrink-0">
                              {c.first_name[0]}{c.last_name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-body1 font-semibold text-t-fg1">{c.first_name} {c.last_name}</span>
                                <TriBadge category={c.tri_category} />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-caption1 text-t-fg3">
                                <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{c.disponibilite}</span>
                                {linkedOffer && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{linkedOffer.title}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {potentialVivier.length > 0 && (
                  <div className="bg-t-warning-bg border border-t-stroke2 rounded-fluent px-4 py-3 text-caption1 text-t-fg2 inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-t-warning" />
                    {potentialVivier.length} profil(s) "A revoir" peuvent aussi etre bascules dans le vivier.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof CalendarDays;
  title: string;
  message: string;
}) {
  return (
    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-12 text-center">
      <Icon className="w-10 h-10 text-t-fg-disabled mx-auto mb-3" strokeWidth={1} />
      <p className="text-body1 text-t-fg2 mb-1">{title}</p>
      <p className="text-caption1 text-t-fg3">{message}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-t-fg3" strokeWidth={1.5} />
        <span className="text-caption1 text-t-fg3">{label}</span>
      </div>
      <span className="text-subtitle1 font-semibold text-t-fg1">{value}</span>
    </div>
  );
}
