import { useEffect, useMemo, useState } from 'react';
import { Copy, MailPlus, ShieldCheck, Trash2, UserRound, Users } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import {
  cancelCompanyInvitation,
  inviteCompanyMember,
  loadCompanyInvitations,
  loadCompanyMembers,
  loadDepartments,
  type CompanyInvitation,
  type CompanyRecruiterMember,
  type Department,
} from '../../lib/domainApi';

type InviteRole = 'RECRUITER' | 'MANAGER' | 'ADMIN';

export default function AdminTeam() {
  const [members, setMembers] = useState<CompanyRecruiterMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('RECRUITER');
  const [inviteDepartmentId, setInviteDepartmentId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function refresh() {
    const [nextMembers, nextInvitations, nextDepartments] = await Promise.all([
      loadCompanyMembers(),
      loadCompanyInvitations(),
      loadDepartments(),
    ]);
    setMembers(nextMembers);
    setInvitations(nextInvitations);
    setDepartments(nextDepartments);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [nextMembers, nextInvitations, nextDepartments] = await Promise.all([
          loadCompanyMembers(),
          loadCompanyInvitations(),
          loadDepartments(),
        ]);
        if (!mounted) return;
        setMembers(nextMembers);
        setInvitations(nextInvitations);
        setDepartments(nextDepartments);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Impossible de charger l'equipe.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pendingInvitations = useMemo(
    () => invitations.filter((invitation) => invitation.status === 'PENDING'),
    [invitations],
  );
  const adminCount = useMemo(() => members.filter((member) => member.role === 'ADMIN').length, [members]);
  const withoutDepartment = useMemo(() => members.filter((member) => !member.departmentId).length, [members]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setError("L'email est obligatoire.");
      return;
    }

    try {
      setInviteLoading(true);
      setError('');
      const created = await inviteCompanyMember({
        email,
        role: inviteRole,
        departmentId: inviteDepartmentId || null,
      });
      setInvitations((current) => [created, ...current]);
      setInviteEmail('');
      setInviteRole('RECRUITER');
      setInviteDepartmentId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'invitation.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyInvitation(invitation: CompanyInvitation) {
    if (!invitation.acceptUrl) return;
    await navigator.clipboard.writeText(invitation.acceptUrl);
    setCopiedId(invitation.invitationId);
    setTimeout(() => setCopiedId(null), 1600);
  }

  async function cancelInvitation(invitationId: string) {
    try {
      await cancelCompanyInvitation(invitationId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'annuler l'invitation.");
    }
  }

  return (
    <>
      <TopBar title="Equipe" subtitle="Membres et invitations de l'entreprise" />
      <main className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-5 space-y-4">
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <SummaryCard label="Membres" value={members.length} icon={Users} loading={loading} />
            <SummaryCard label="Admins" value={adminCount} icon={ShieldCheck} loading={loading} />
            <SummaryCard label="Sans service" value={withoutDepartment} icon={UserRound} loading={loading} />
            <SummaryCard label="Invitations" value={pendingInvitations.length} icon={MailPlus} loading={loading} />
          </section>

          {error && (
            <div className="bg-t-danger-bg border border-red-200 text-t-danger rounded-fluent px-4 py-3 text-caption1">
              {error}
            </div>
          )}

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
            <h1 className="text-subtitle2 font-semibold text-t-fg1">Inviter un membre</h1>
            <p className="text-caption1 text-t-fg3 mt-0.5">
              L'invité créera son mot de passe depuis un lien rattaché à votre entreprise.
            </p>
            <form onSubmit={handleInvite} className="mt-4 grid md:grid-cols-[1.4fr_0.8fr_0.9fr_auto] gap-3 items-end">
              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Email</span>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                  placeholder="membre@entreprise.com"
                />
              </label>
              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Role</span>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as InviteRole)}
                  className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                >
                  <option value="RECRUITER">Recruteur</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Service</span>
                <select
                  value={inviteDepartmentId}
                  onChange={(e) => setInviteDepartmentId(e.target.value)}
                  className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                >
                  <option value="">Aucun</option>
                  {departments.map((department) => (
                    <option key={department.departmentId} value={department.departmentId}>{department.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={inviteLoading}
                className="h-9 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <MailPlus className="w-4 h-4" />
                Inviter
              </button>
            </form>
          </section>

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-subtitle2 font-semibold text-t-fg1">Invitations en attente</h2>
              <p className="text-caption1 text-t-fg3 mt-0.5">Copiez le lien et envoyez-le au membre concerné.</p>
            </div>
            {pendingInvitations.length === 0 ? (
              <div className="px-5 py-8 text-center text-caption1 text-t-fg3">Aucune invitation en attente.</div>
            ) : (
              <div className="divide-y divide-t-stroke3">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.invitationId} className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-body1 font-semibold text-t-fg1 truncate">{invitation.email}</p>
                      <p className="text-caption1 text-t-fg3 truncate">
                        {invitation.role} · {invitation.departmentName || 'Sans service'} · expire le {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString('fr-FR') : 'non renseigné'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyInvitation(invitation)}
                        className="h-8 px-3 border border-t-stroke2 rounded-fluent text-caption1 text-t-fg2 hover:bg-t-bg1-hover inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === invitation.invitationId ? 'Copié' : 'Copier le lien'}
                      </button>
                      <button
                        onClick={() => cancelInvitation(invitation.invitationId)}
                        className="h-8 px-3 border border-red-200 rounded-fluent text-caption1 text-t-danger hover:bg-t-danger-bg inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <MembersList loading={loading} members={members} />
        </div>
      </main>
    </>
  );
}

function MembersList({ loading, members }: { loading: boolean; members: CompanyRecruiterMember[] }) {
  return (
    <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
      <div className="px-5 py-4 border-b border-t-stroke3">
        <h2 className="text-subtitle2 font-semibold text-t-fg1">Membres actifs</h2>
        <p className="text-caption1 text-t-fg3 mt-0.5">
          L'Admin consulte l'équipe et garde une vue claire des responsabilités.
        </p>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 rounded-fluent bg-t-bg4 animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="px-5 py-10 text-center text-caption1 text-t-fg3">
          Aucun membre rattaché à cette entreprise.
        </div>
      ) : (
        <div className="divide-y divide-t-stroke3">
          {members.map((member) => (
            <div key={member.recruiterId} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-t-bg-brand-selected text-t-fg-brand flex items-center justify-center shrink-0 font-semibold">
                  {initials(member.name || member.email)}
                </div>
                <div className="min-w-0">
                  <p className="text-body1 font-semibold text-t-fg1 truncate">{member.name || 'Sans nom'}</p>
                  <p className="text-caption1 text-t-fg3 truncate">{member.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge tone={member.role === 'ADMIN' ? 'brand' : 'neutral'}>{member.role}</Badge>
                <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>{member.status || 'statut inconnu'}</Badge>
                <Badge tone={member.departmentName ? 'neutral' : 'warning'}>
                  {member.departmentName || 'Sans service'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function initials(value: string) {
  return value
    .split(/[ .@_-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SummaryCard({ label, value, icon: Icon, loading }: { label: string; value: number; icon: typeof Users; loading: boolean }) {
  return (
    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption1 text-t-fg3">{label}</span>
        <Icon className="w-4 h-4 text-t-fg3" />
      </div>
      <p className="text-subtitle1 font-semibold text-t-fg1 mt-2">
        {loading ? <span className="inline-block w-10 h-5 rounded bg-t-bg4 animate-pulse" /> : value}
      </p>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'brand' | 'success' | 'warning' | 'neutral' }) {
  const cls = {
    brand: 'bg-t-bg-brand-selected text-t-fg-brand border-t-stroke-brand/30',
    success: 'bg-t-success-bg text-t-success border-t-stroke3',
    warning: 'bg-t-warning-bg text-t-warning border-t-stroke3',
    neutral: 'bg-t-bg2 text-t-fg2 border-t-stroke3',
  }[tone];

  return <span className={`text-caption2 px-2 py-1 rounded-full border ${cls}`}>{children}</span>;
}
