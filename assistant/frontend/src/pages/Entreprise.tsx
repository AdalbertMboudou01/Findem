import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  Building2,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  X,
  LayoutGrid,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import {
  inviteRecruiter,
  loadCompanyInvitations,
  loadCompanyMembers,
  loadDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignMemberToDepartment,
  removeMemberFromDepartment,
  loadRecruitmentData,
  type CompanyInvitation,
  type CompanyRecruiterMember,
  type Department,
} from '../lib/domainApi';
import { useAuth } from '../lib/AuthContext';
import type { Offer } from '../types';

type Tab = 'apercu' | 'services' | 'membres';

const tabConfig: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'apercu', label: 'Aperçu', icon: LayoutGrid },
  { key: 'services', label: 'Services', icon: Briefcase },
  { key: 'membres', label: 'Membres', icon: Users },
];

export default function Entreprise() {
  const { user } = useAuth();
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN';
  const [activeTab, setActiveTab] = useState<Tab>('apercu');

  // Data
  const [offers, setOffers] = useState<Offer[]>([]);
  const [members, setMembers] = useState<CompanyRecruiterMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'RECRUITER' | 'ADMIN'>('RECRUITER');
  const [inviteDeptId, setInviteDeptId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Department form
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState('');

  // Department detail (member assignment)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [data, recruiterMembers, depts] = await Promise.all([
          loadRecruitmentData(),
          loadCompanyMembers(),
          loadDepartments(),
        ]);
        let pendingInvitations: CompanyInvitation[] = [];
        if (isAdmin) {
          try { pendingInvitations = await loadCompanyInvitations(); } catch { /* ignore */ }
        }
        if (!mounted) return;
        setOffers(data.offers);
        setMembers(recruiterMembers);
        setDepartments(depts);
        setInvitations(pendingInvitations);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les données.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAdmin]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    if (!inviteEmail.trim()) { setInviteError('Email obligatoire.'); return; }
    try {
      setInviteLoading(true);
      const created = await inviteRecruiter({ email: inviteEmail.trim(), role: inviteRole });
      setInvitations((c) => [created, ...c]);
      setInviteEmail('');
      setInviteRole('RECRUITER');
      setInviteDeptId('');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Impossible d'envoyer l'invitation.");
    } finally {
      setInviteLoading(false);
    }
  }

  function openCreateDept() {
    setEditingDept(null);
    setDeptName('');
    setDeptDesc('');
    setDeptError('');
    setDeptFormOpen(true);
  }

  function openEditDept(dept: Department) {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setDeptError('');
    setDeptFormOpen(true);
  }

  async function handleDeptSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = deptName.trim();
    if (!name) { setDeptError('Le nom est obligatoire.'); return; }
    try {
      setDeptLoading(true);
      if (editingDept) {
        const updated = await updateDepartment(editingDept.departmentId, { name, description: deptDesc.trim() || undefined });
        setDepartments((c) => c.map((d) => d.departmentId === updated.departmentId ? updated : d));
        if (selectedDept?.departmentId === updated.departmentId) setSelectedDept(updated);
      } else {
        const created = await createDepartment({ name, description: deptDesc.trim() || undefined });
        setDepartments((c) => [...c, created]);
      }
      setDeptFormOpen(false);
    } catch (err) {
      setDeptError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setDeptLoading(false);
    }
  }

  async function handleDeleteDept(dept: Department) {
    if (!confirm(`Supprimer le service "${dept.name}" ? Les membres seront désaffectés.`)) return;
    try {
      await deleteDepartment(dept.departmentId);
      setDepartments((c) => c.filter((d) => d.departmentId !== dept.departmentId));
      if (selectedDept?.departmentId === dept.departmentId) setSelectedDept(null);
      setMembers((c) => c.map((m) => m.departmentId === dept.departmentId ? { ...m, departmentId: null, departmentName: null } : m));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  }

  async function toggleMemberDept(member: CompanyRecruiterMember, deptId: string) {
    setAssignLoading(member.recruiterId);
    try {
      if (member.departmentId === deptId) {
        await removeMemberFromDepartment(deptId, member.recruiterId);
        setMembers((c) => c.map((m) => m.recruiterId === member.recruiterId ? { ...m, departmentId: null, departmentName: null } : m));
        setDepartments((c) => c.map((d) => d.departmentId === deptId ? { ...d, memberCount: Math.max(0, d.memberCount - 1) } : d));
      } else {
        const dept = departments.find((d) => d.departmentId === deptId);
        await assignMemberToDepartment(deptId, member.recruiterId);
        const oldDeptId = member.departmentId;
        setMembers((c) => c.map((m) => m.recruiterId === member.recruiterId
          ? { ...m, departmentId: deptId, departmentName: dept?.name || '' }
          : m));
        setDepartments((c) => c.map((d) => {
          if (d.departmentId === deptId) return { ...d, memberCount: d.memberCount + 1 };
          if (d.departmentId === oldDeptId) return { ...d, memberCount: Math.max(0, d.memberCount - 1) };
          return d;
        }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'affectation.");
    } finally {
      setAssignLoading(null);
    }
  }

  function copyToken(inv: CompanyInvitation) {
    if (!inv.invitationToken) return;
    navigator.clipboard.writeText(inv.invitationToken);
    setCopiedTokenId(inv.invitationId);
    setTimeout(() => setCopiedTokenId(null), 1800);
  }

  const activeOffers = offers.filter((o) => o.status === 'ouvert').length;

  return (
    <>
      <TopBar title="Entreprise" subtitle="Configuration et gestion de l'équipe" />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Mobile tabs */}
        <div className="md:hidden flex items-center border-b border-t-stroke2 bg-t-bg2 px-2 shrink-0 overflow-x-auto">
          {tabConfig.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-caption1 font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'border-t-stroke-brand text-t-fg-brand' : 'border-transparent text-t-fg3 hover:text-t-fg2'
              }`}>
              <tab.icon className="w-4 h-4" strokeWidth={1.5} />{tab.label}
            </button>
          ))}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex w-[220px] shrink-0 border-r border-t-stroke2 flex-col bg-t-bg2">
          <div className="px-4 py-3 border-b border-t-stroke3">
            <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Paramètres</h3>
          </div>
          <div className="flex-1 py-1">
            {tabConfig.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-[3px] transition-colors ${
                  activeTab === tab.key ? 'bg-t-bg-subtle-selected border-l-t-stroke-brand' : 'hover:bg-t-bg-subtle-hover border-l-transparent'
                }`}>
                <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.key ? 'text-t-fg-brand' : 'text-t-fg3'}`} strokeWidth={1.5} />
                <span className={`text-body1 flex-1 text-left ${activeTab === tab.key ? 'font-semibold text-t-fg1' : 'text-t-fg2'}`}>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-t-stroke3 space-y-1.5">
            <div className="flex items-center justify-between text-caption2">
              <span className="text-t-fg3">Offres ouvertes</span>
              <span className="text-t-fg1 font-medium">{activeOffers}</span>
            </div>
            <div className="flex items-center justify-between text-caption2">
              <span className="text-t-fg3">Membres</span>
              <span className="text-t-fg1 font-medium">{members.length}</span>
            </div>
            <div className="flex items-center justify-between text-caption2">
              <span className="text-t-fg3">Services</span>
              <span className="text-t-fg1 font-medium">{departments.length}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-t-bg3">
          <div className="max-w-[840px] mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4">

            {loading && <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">Chargement...</div>}
            {!loading && error && <div className="bg-t-bg1 border border-t-danger rounded-fluent px-4 py-3 text-caption1 text-t-danger">{error}</div>}

            {/* APERÇU */}
            {!loading && !error && activeTab === 'apercu' && (
              <>
                <div>
                  <h2 className="text-subtitle2 font-semibold text-t-fg1">Vue d'ensemble</h2>
                  <p className="text-caption1 text-t-fg3 mt-0.5">État de votre espace entreprise</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="Offres ouvertes" value={activeOffers} icon={Briefcase} />
                  <StatCard label="Membres" value={members.length} icon={Users} />
                  <StatCard label="Services" value={departments.length} icon={Building2} />
                </div>
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
                  <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Services actifs</h3>
                  {departments.length === 0 ? (
                    <p className="text-caption1 text-t-fg3">Aucun service créé. <button onClick={() => setActiveTab('services')} className="text-t-fg-brand hover:underline">Créer un service →</button></p>
                  ) : (
                    <div className="space-y-2">
                      {departments.map((d) => (
                        <div key={d.departmentId} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Briefcase className="w-4 h-4 text-t-fg3 shrink-0" strokeWidth={1.5} />
                            <span className="text-body1 text-t-fg1 truncate">{d.name}</span>
                          </div>
                          <span className="text-caption1 text-t-fg3 shrink-0">{d.memberCount} membre{d.memberCount !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* SERVICES */}
            {!loading && !error && activeTab === 'services' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-subtitle2 font-semibold text-t-fg1">Services</h2>
                    <p className="text-caption1 text-t-fg3 mt-0.5">Organisez votre équipe par département</p>
                  </div>
                  {isAdmin && (
                    <button onClick={openCreateDept}
                      className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors">
                      <Plus className="w-4 h-4" /> Nouveau service
                    </button>
                  )}
                </div>

                {/* Department form modal */}
                {deptFormOpen && (
                  <div className="bg-t-bg1 border border-t-stroke-brand rounded-fluent px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-caption1 font-semibold text-t-fg1">{editingDept ? 'Modifier le service' : 'Nouveau service'}</span>
                      <button onClick={() => setDeptFormOpen(false)} className="text-t-fg3 hover:text-t-fg1"><X className="w-4 h-4" /></button>
                    </div>
                    {deptError && <div className="text-caption1 text-t-danger">{deptError}</div>}
                    <form onSubmit={handleDeptSubmit} className="space-y-2">
                      <input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="Nom du service (ex: Finance, IT, RH...)"
                        className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors" />
                      <input value={deptDesc} onChange={(e) => setDeptDesc(e.target.value)} placeholder="Description (optionnel)"
                        className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors" />
                      <div className="flex gap-2">
                        <button type="submit" disabled={deptLoading}
                          className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors disabled:opacity-60">
                          {deptLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          {editingDept ? 'Enregistrer' : 'Créer'}
                        </button>
                        <button type="button" onClick={() => setDeptFormOpen(false)}
                          className="h-8 px-3 text-t-fg2 text-caption1 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover transition-colors">
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Department list */}
                {departments.length === 0 ? (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-12 text-center">
                    <Briefcase className="w-10 h-10 text-t-fg-disabled mx-auto mb-3" strokeWidth={1} />
                    <p className="text-body1 text-t-fg2 mb-1">Aucun service créé</p>
                    <p className="text-caption1 text-t-fg3">Créez des services pour organiser vos membres par département.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div key={dept.departmentId}>
                        <div
                          className={`bg-t-bg1 border rounded-fluent px-4 py-3 cursor-pointer transition-colors ${
                            selectedDept?.departmentId === dept.departmentId ? 'border-t-stroke-brand' : 'border-t-stroke3 hover:border-t-stroke2'
                          }`}
                          onClick={() => setSelectedDept(selectedDept?.departmentId === dept.departmentId ? null : dept)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Briefcase className="w-4 h-4 text-t-fg-brand shrink-0" strokeWidth={1.5} />
                              <div className="min-w-0">
                                <p className="text-body1 font-semibold text-t-fg1 truncate">{dept.name}</p>
                                {dept.description && <p className="text-caption1 text-t-fg3 truncate">{dept.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-caption1 text-t-fg3">{dept.memberCount} membre{dept.memberCount !== 1 ? 's' : ''}</span>
                              {isAdmin && (
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => openEditDept(dept)} className="p-1.5 text-t-fg3 hover:text-t-fg1 hover:bg-t-bg1-hover rounded transition-colors">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteDept(dept)} className="p-1.5 text-t-fg3 hover:text-t-danger hover:bg-t-danger-bg rounded transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              <ChevronRight className={`w-4 h-4 text-t-fg3 transition-transform ${selectedDept?.departmentId === dept.departmentId ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                        </div>

                        {/* Member assignment panel */}
                        {selectedDept?.departmentId === dept.departmentId && (
                          <div className="ml-4 mt-1 bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
                            <p className="text-caption1 font-semibold text-t-fg2 mb-3">Membres du service</p>
                            {members.length === 0 ? (
                              <p className="text-caption1 text-t-fg3">Aucun membre dans l'entreprise.</p>
                            ) : (
                              <div className="space-y-2">
                                {members.map((m) => {
                                  const isInDept = m.departmentId === dept.departmentId;
                                  const isInOther = m.departmentId !== null && m.departmentId !== dept.departmentId;
                                  return (
                                    <div key={m.recruiterId} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-fluent border ${
                                      isInDept ? 'border-t-stroke-brand bg-t-bg-subtle-selected' : 'border-t-stroke3'
                                    }`}>
                                      <div className="min-w-0">
                                        <p className="text-body1 text-t-fg1 font-medium truncate">{m.name || 'Sans nom'}</p>
                                        <p className="text-caption1 text-t-fg3 truncate">{m.email}
                                          {isInOther && <span className="ml-2 text-t-fg-disabled">({m.departmentName})</span>}
                                        </p>
                                      </div>
                                      {isAdmin && (
                                        <button
                                          disabled={assignLoading === m.recruiterId}
                                          onClick={() => toggleMemberDept(m, dept.departmentId)}
                                          className={`h-7 px-2.5 text-caption1 font-medium rounded-fluent inline-flex items-center gap-1 transition-colors shrink-0 ${
                                            isInDept
                                              ? 'bg-t-bg-brand/10 text-t-fg-brand hover:bg-t-danger-bg hover:text-t-danger'
                                              : 'bg-t-bg2 text-t-fg2 hover:bg-t-bg-brand/10 hover:text-t-fg-brand border border-t-stroke2'
                                          }`}
                                        >
                                          {assignLoading === m.recruiterId ? <Loader2 className="w-3 h-3 animate-spin" /> : isInDept ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                          {isInDept ? 'Retirer' : 'Ajouter'}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* MEMBRES */}
            {!loading && !error && activeTab === 'membres' && (
              <>
                <div>
                  <h2 className="text-subtitle2 font-semibold text-t-fg1">Membres</h2>
                  <p className="text-caption1 text-t-fg3 mt-0.5">Gérez l'équipe et les accès</p>
                </div>

                {/* Invite form */}
                {isAdmin ? (
                  <form onSubmit={handleInvite} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-caption1 text-t-fg2 font-semibold">
                      <UserPlus className="w-4 h-4" /> Inviter un membre
                    </div>
                    {inviteError && <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">{inviteError}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@entreprise.com"
                        className="h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors" />
                      <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'RECRUITER' | 'ADMIN')}
                        className="h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors">
                        <option value="RECRUITER">Recruteur</option>
                        <option value="ADMIN">Admin</option>
                        {/* TODO: activer HIRING_MANAGER et OBSERVER quand les permissions backend sont implémentées */}
                      </select>
                    </div>
                    <select value={inviteDeptId} onChange={(e) => setInviteDeptId(e.target.value)}
                      className="w-full sm:w-1/2 h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors">
                      <option value="">— Service (optionnel) —</option>
                      {departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
                    </select>
                    <button type="submit" disabled={inviteLoading}
                      className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5 transition-colors disabled:opacity-60">
                      {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Envoyer l'invitation
                    </button>
                  </form>
                ) : (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3 text-caption1 text-t-fg3">Seuls les admins peuvent inviter des membres.</div>
                )}

                {/* Members list */}
                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
                  <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Membres actifs ({members.length})</h3>
                  {members.length === 0 ? (
                    <p className="text-caption1 text-t-fg3">Aucun membre trouvé.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.recruiterId} className="flex items-center justify-between gap-3 border border-t-stroke3 rounded-fluent px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-body1 text-t-fg1 font-semibold truncate">{m.name || 'Sans nom'}</p>
                            <p className="text-caption1 text-t-fg3 truncate">{m.email}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {m.departmentName && (
                              <span className="text-caption2 px-2 py-0.5 bg-t-bg-brand/10 text-t-fg-brand rounded-full border border-t-stroke-brand/30">
                                {m.departmentName}
                              </span>
                            )}
                            <div className="inline-flex items-center gap-1 text-caption2 text-t-fg2">
                              {m.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                              {m.role}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending invitations */}
                {isAdmin && invitations.length > 0 && (
                  <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
                    <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Invitations en attente ({invitations.length})</h3>
                    <div className="space-y-2">
                      {invitations.map((inv) => (
                        <div key={inv.invitationId} className="flex items-center justify-between gap-3 border border-t-stroke3 rounded-fluent px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-body1 text-t-fg1 font-semibold truncate">{inv.email}</p>
                            <p className="text-caption1 text-t-fg3">{inv.role} • {inv.status}</p>
                          </div>
                          {inv.invitationToken && (
                            <button onClick={() => copyToken(inv)}
                              className="h-7 px-2 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors">
                              {copiedTokenId === inv.invitationId ? <Check className="w-3.5 h-3.5 text-t-success" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedTokenId === inv.invitationId ? 'Copié' : 'Token'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
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

