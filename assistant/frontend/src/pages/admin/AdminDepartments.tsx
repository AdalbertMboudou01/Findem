import { useEffect, useMemo, useState } from 'react';
import { Loader2, Network, Plus, Save, Trash2, X } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import {
  assignMemberToDepartment,
  createDepartment,
  deleteDepartment,
  loadCompanyMembers,
  loadDepartments,
  removeMemberFromDepartment,
  updateDepartment,
  type CompanyRecruiterMember,
  type Department,
} from '../../lib/domainApi';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<CompanyRecruiterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function refresh() {
    const [nextDepartments, nextMembers] = await Promise.all([loadDepartments(), loadCompanyMembers()]);
    setDepartments(nextDepartments);
    setMembers(nextMembers);
    if (!selectedId && nextDepartments.length > 0) {
      setSelectedId(nextDepartments[0].departmentId);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [nextDepartments, nextMembers] = await Promise.all([loadDepartments(), loadCompanyMembers()]);
        if (!mounted) return;
        setDepartments(nextDepartments);
        setMembers(nextMembers);
        setSelectedId(nextDepartments[0]?.departmentId || null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger les services.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(
    () => departments.find((department) => department.departmentId === selectedId) || null,
    [departments, selectedId],
  );

  const selectedMembers = useMemo(
    () => members.filter((member) => member.departmentId === selectedId),
    [members, selectedId],
  );

  const availableMembers = useMemo(
    () => members.filter((member) => member.departmentId !== selectedId),
    [members, selectedId],
  );

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setError('');
  }

  function openEdit(department: Department) {
    setEditing(department);
    setName(department.name);
    setDescription(department.description || '');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Le nom du service est obligatoire.');
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await updateDepartment(editing.departmentId, { name: cleanName, description: description.trim() || undefined });
      } else {
        const created = await createDepartment({ name: cleanName, description: description.trim() || undefined });
        setSelectedId(created.departmentId);
      }
      setName('');
      setDescription('');
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder le service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(department: Department) {
    if (!confirm(`Supprimer le service "${department.name}" ?`)) return;
    try {
      await deleteDepartment(department.departmentId);
      setSelectedId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le service.');
    }
  }

  async function assign(member: CompanyRecruiterMember) {
    if (!selectedId) return;
    try {
      await assignMemberToDepartment(selectedId, member.recruiterId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'affecter le membre.");
    }
  }

  async function remove(member: CompanyRecruiterMember) {
    if (!selectedId) return;
    try {
      await removeMemberFromDepartment(selectedId, member.recruiterId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de retirer le membre.");
    }
  }

  return (
    <>
      <TopBar title="Services" subtitle="Organisation interne et rattachement des membres" />
      <main className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-5 space-y-4">
          {error && (
            <div className="bg-t-danger-bg border border-red-200 text-t-danger rounded-fluent px-4 py-3 text-caption1">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent overflow-hidden">
              <div className="px-4 py-4 border-b border-t-stroke3 flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-subtitle2 font-semibold text-t-fg1">Services</h1>
                  <p className="text-caption1 text-t-fg3">{departments.length} service(s)</p>
                </div>
                <button
                  onClick={openCreate}
                  className="h-8 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau
                </button>
              </div>

              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 bg-t-bg4 rounded-fluent animate-pulse" />)}
                </div>
              ) : departments.length === 0 ? (
                <div className="px-4 py-10 text-center text-caption1 text-t-fg3">Aucun service configuré.</div>
              ) : (
                <div className="p-2 space-y-1">
                  {departments.map((department) => (
                    <button
                      key={department.departmentId}
                      onClick={() => setSelectedId(department.departmentId)}
                      className={`w-full text-left rounded-fluent px-3 py-3 border transition-colors ${
                        selectedId === department.departmentId
                          ? 'border-t-stroke-brand bg-t-bg-brand-selected'
                          : 'border-transparent hover:bg-t-bg2'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-body1 font-semibold text-t-fg1 truncate">{department.name}</span>
                          <span className="block text-caption1 text-t-fg3 truncate">{department.memberCount} membre(s)</span>
                        </span>
                        <Network className="w-4 h-4 text-t-fg3 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                <h2 className="text-subtitle2 font-semibold text-t-fg1">{editing ? 'Modifier le service' : 'Nouveau service'}</h2>
                <form onSubmit={handleSubmit} className="mt-4 grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <label className="block">
                    <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Nom</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                      placeholder="Ex: RH, IT, Finance"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Description</span>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand"
                      placeholder="Optionnel"
                    />
                  </label>
                  <div className="flex gap-2">
                    {editing && (
                      <button
                        type="button"
                        onClick={openCreate}
                        className="h-9 w-9 border border-t-stroke2 rounded-fluent flex items-center justify-center text-t-fg3 hover:bg-t-bg1-hover"
                        aria-label="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="h-9 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Sauver
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                {selected ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h2 className="text-subtitle2 font-semibold text-t-fg1">{selected.name}</h2>
                        <p className="text-caption1 text-t-fg3 mt-0.5">{selected.description || 'Aucune description.'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(selected)} className="h-8 px-3 border border-t-stroke2 rounded-fluent text-caption1 text-t-fg2 hover:bg-t-bg1-hover">
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(selected)} className="h-8 px-3 border border-red-200 rounded-fluent text-caption1 text-t-danger hover:bg-t-danger-bg inline-flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid lg:grid-cols-2 gap-4">
                      <MemberColumn title="Dans ce service" empty="Aucun membre dans ce service.">
                        {selectedMembers.map((member) => (
                          <MemberRow key={member.recruiterId} member={member} actionLabel="Retirer" onAction={() => remove(member)} />
                        ))}
                      </MemberColumn>
                      <MemberColumn title="Autres membres" empty="Aucun autre membre disponible.">
                        {availableMembers.map((member) => (
                          <MemberRow key={member.recruiterId} member={member} actionLabel="Ajouter" onAction={() => assign(member)} />
                        ))}
                      </MemberColumn>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center text-caption1 text-t-fg3">Sélectionnez ou créez un service.</div>
                )}
              </section>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function MemberColumn({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="border border-t-stroke3 rounded-fluent overflow-hidden">
      <div className="px-3 py-2 bg-t-bg2 border-b border-t-stroke3 text-caption1 font-semibold text-t-fg2">{title}</div>
      <div className="p-2 space-y-2">
        {hasChildren ? children : <p className="px-2 py-4 text-caption1 text-t-fg3 text-center">{empty}</p>}
      </div>
    </div>
  );
}

function MemberRow({ member, actionLabel, onAction }: { member: CompanyRecruiterMember; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-fluent border border-t-stroke3 bg-t-bg1">
      <div className="min-w-0">
        <p className="text-body1 font-semibold text-t-fg1 truncate">{member.name || 'Sans nom'}</p>
        <p className="text-caption1 text-t-fg3 truncate">{member.email}</p>
      </div>
      <button onClick={onAction} className="h-7 px-2.5 rounded-fluent border border-t-stroke2 text-caption1 text-t-fg2 hover:bg-t-bg1-hover shrink-0">
        {actionLabel}
      </button>
    </div>
  );
}
