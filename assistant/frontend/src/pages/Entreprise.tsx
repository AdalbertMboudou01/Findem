import { useEffect, useState } from 'react';
import {
  CalendarDays,
  MessageSquare,
  Megaphone,
  Users,
  UserPlus,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import {
  inviteRecruiter,
  loadCompanyInvitations,
  loadCompanyMembers,
  loadRecruitmentData,
  type CompanyInvitation,
  type CompanyRecruiterMember,
} from '../lib/domainApi';
import { useAuth } from '../lib/AuthContext';
import type { Offer } from '../types';

type Tab = 'entretiens' | 'discussions' | 'annonces' | 'equipe';

const tabConfig: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
  { key: 'entretiens', label: 'Entretiens', icon: CalendarDays },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare },
  { key: 'annonces', label: 'Annonces', icon: Megaphone },
  { key: 'equipe', label: 'Equipe', icon: Users },
];

export default function Entreprise() {
  const { user } = useAuth();
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN';
  const [activeTab, setActiveTab] = useState<Tab>('entretiens');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [members, setMembers] = useState<CompanyRecruiterMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'RECRUITER' | 'ADMIN'>('RECRUITER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [data, recruiterMembers] = await Promise.all([
          loadRecruitmentData(),
          loadCompanyMembers(),
        ]);

        let pendingInvitations: CompanyInvitation[] = [];
        if (isAdmin) {
          try {
            pendingInvitations = await loadCompanyInvitations();
          } catch {
            pendingInvitations = [];
          }
        }

        if (!mounted) return;
        setOffers(data.offers);
        setMembers(recruiterMembers);
        setInvitations(pendingInvitations);
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
  }, [isAdmin]);

  async function handleInviteRecruiter(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');

    if (!inviteEmail.trim()) {
      setInviteError('Email obligatoire.');
      return;
    }

    try {
      setInviteLoading(true);
      const created = await inviteRecruiter({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInvitations((current) => [created, ...current]);
      setInviteEmail('');
      setInviteRole('RECRUITER');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Impossible d\'envoyer l\'invitation.');
    } finally {
      setInviteLoading(false);
    }
  }

  function copyInvitationToken(invitation: CompanyInvitation) {
    if (!invitation.invitationToken) return;
    navigator.clipboard.writeText(invitation.invitationToken);
    setCopiedTokenId(invitation.invitationId);
    setTimeout(() => setCopiedTokenId(null), 1800);
  }

  const counts = {
    entretiens: 0,
    discussions: 0,
    annonces: 0,
    equipe: members.length,
  };

  return (
    <>
      <TopBar title="Entreprise" subtitle="Espace equipe et operations" />
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

            {!loading && !error && activeTab === 'equipe' && (
              <>
                <div>
                  <h2 className="text-subtitle2 font-semibold text-t-fg1">Equipe recrutement</h2>
                  <p className="text-caption1 text-t-fg3 mt-0.5">Membres actifs et invitations en attente</p>
                </div>

                {isAdmin ? (
                  <form onSubmit={handleInviteRecruiter} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-caption1 text-t-fg2 font-semibold">
                      <UserPlus className="w-4 h-4" />
                      Inviter un recruteur
                    </div>
                    {inviteError ? (
                      <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
                        {inviteError}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="recruteur@entreprise.com"
                        className="sm:col-span-2 h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'RECRUITER' | 'ADMIN')}
                        className="h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
                      >
                        <option value="RECRUITER">RECRUITER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Envoyer l'invitation
                    </button>
                  </form>
                ) : (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">
                    Seuls les admins peuvent inviter des recruteurs.
                  </div>
                )}

                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
                  <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Membres</h3>
                  {members.length === 0 ? (
                    <p className="text-caption1 text-t-fg3">Aucun membre trouve.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div key={member.recruiterId} className="flex items-center justify-between gap-3 border border-t-stroke3 rounded-fluent px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-body1 text-t-fg1 font-semibold truncate">{member.name || 'Sans nom'}</p>
                            <p className="text-caption1 text-t-fg3 truncate">{member.email}</p>
                          </div>
                          <div className="inline-flex items-center gap-1 text-caption2 text-t-fg2">
                            {member.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                            {member.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
                    <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Invitations</h3>
                    {invitations.length === 0 ? (
                      <p className="text-caption1 text-t-fg3">Aucune invitation en attente.</p>
                    ) : (
                      <div className="space-y-2">
                        {invitations.map((inv) => (
                          <div key={inv.invitationId} className="flex items-center justify-between gap-3 border border-t-stroke3 rounded-fluent px-3 py-2">
                            <div className="min-w-0">
                              <p className="text-body1 text-t-fg1 font-semibold truncate">{inv.email}</p>
                              <p className="text-caption1 text-t-fg3">{inv.role} • {inv.status}</p>
                            </div>
                            {inv.invitationToken ? (
                              <button
                                onClick={() => copyInvitationToken(inv)}
                                className="h-7 px-2 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors"
                              >
                                {copiedTokenId === inv.invitationId ? <Check className="w-3.5 h-3.5 text-t-success" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedTokenId === inv.invitationId ? 'Copie' : 'Token'}
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
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
