import { useEffect, useMemo, useState } from 'react';
import { Building2, Briefcase, CheckCircle2, Network, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/layout/TopBar';
import {
  loadCompanyMembers,
  loadCurrentCompanyProfile,
  loadDepartments,
  loadRecruitmentData,
  type CompanyProfile,
  type CompanyRecruiterMember,
  type Department,
} from '../../lib/domainApi';
import { useAuth } from '../../lib/AuthContext';
import type { Offer } from '../../types';

type AdminSnapshot = {
  profile: CompanyProfile | null;
  members: CompanyRecruiterMember[];
  departments: Department[];
  offers: Offer[];
};

const emptySnapshot: AdminSnapshot = {
  profile: null,
  members: [],
  departments: [],
  offers: [],
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [profile, members, departments, recruitment] = await Promise.all([
          loadCurrentCompanyProfile(),
          loadCompanyMembers(),
          loadDepartments(),
          loadRecruitmentData(),
        ]);
        if (!mounted) return;
        setSnapshot({ profile, members, departments, offers: recruitment.offers });
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Impossible de charger l'espace admin.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const activeOffers = useMemo(() => snapshot.offers.filter((offer) => offer.status === 'ouvert').length, [snapshot.offers]);
  const missingProfileFields = [
    !snapshot.profile?.name?.trim() ? 'Nom entreprise' : null,
    !snapshot.profile?.sector?.trim() ? 'Secteur' : null,
    !snapshot.profile?.size?.trim() ? 'Taille' : null,
  ].filter((item): item is string => Boolean(item));

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';

  return (
    <>
      <TopBar title="Admin entreprise" subtitle="Pilotage simple de votre organisation" />
      <main className="flex-1 overflow-y-auto bg-t-bg3">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-5 space-y-5">
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-caption1 text-t-fg3">Bonjour {firstName}</p>
                <h1 className="text-subtitle1 font-semibold text-t-fg1 mt-0.5">
                  {snapshot.profile?.name || 'Votre espace entreprise'}
                </h1>
                <p className="text-caption1 text-t-fg3 mt-1 max-w-2xl">
                  Gérez l'identité de l'entreprise, l'équipe et les services depuis un espace volontairement concentré.
                </p>
              </div>
              <Link
                to="/admin/company"
                className="h-9 px-3 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-caption1 font-semibold rounded-fluent inline-flex items-center justify-center gap-2 shrink-0"
              >
                <Building2 className="w-4 h-4" />
                Profil entreprise
              </Link>
            </div>
          </section>

          {error && (
            <div className="bg-t-danger-bg border border-red-200 text-t-danger rounded-fluent px-4 py-3 text-caption1">
              {error}
            </div>
          )}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard loading={loading} label="Membres" value={snapshot.members.length} icon={Users} />
            <MetricCard loading={loading} label="Services" value={snapshot.departments.length} icon={Network} />
            <MetricCard loading={loading} label="Offres ouvertes" value={activeOffers} icon={Briefcase} />
            <MetricCard loading={loading} label="Profil" value={missingProfileFields.length === 0 ? 'OK' : `${missingProfileFields.length} champ(s)`} icon={CheckCircle2} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-subtitle2 font-semibold text-t-fg1">Actions admin</h2>
                  <p className="text-caption1 text-t-fg3">Les raccourcis essentiels pour maintenir l'organisation propre.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <ActionLink to="/admin/team" icon={Users} title="Gérer l'équipe" description="Consulter les membres et leurs rattachements." />
                <ActionLink to="/admin/departments" icon={Network} title="Structurer les services" description="Créer les services et affecter les recruteurs." />
                <ActionLink to="/admin/company" icon={Building2} title="Mettre à jour l'entreprise" description="Nom, secteur, taille et site web." />
                <ActionLink to="/admin/settings" icon={Settings} title="Paramètres" description="Compte, thème et préférences de l'espace." />
              </div>
            </div>

            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
              <h2 className="text-subtitle2 font-semibold text-t-fg1">À vérifier</h2>
              <div className="mt-4 space-y-3">
                <HealthRow
                  ok={missingProfileFields.length === 0}
                  title="Profil entreprise"
                  detail={missingProfileFields.length === 0 ? 'Les informations minimales sont renseignées.' : `À compléter : ${missingProfileFields.join(', ')}.`}
                  to="/admin/company"
                />
                <HealthRow
                  ok={snapshot.members.length > 0}
                  title="Équipe"
                  detail={snapshot.members.length > 0 ? `${snapshot.members.length} membre(s) actif(s).` : 'Aucun membre rattaché.'}
                  to="/admin/team"
                />
                <HealthRow
                  ok={snapshot.departments.length > 0}
                  title="Services"
                  detail={snapshot.departments.length > 0 ? `${snapshot.departments.length} service(s) configuré(s).` : 'Aucun service configuré.'}
                  to="/admin/departments"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function MetricCard({ label, value, icon: Icon, loading }: { label: string; value: number | string; icon: typeof Users; loading: boolean }) {
  return (
    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption1 text-t-fg3">{label}</span>
        <Icon className="w-4 h-4 text-t-fg3" strokeWidth={1.7} />
      </div>
      <p className="text-subtitle1 font-semibold text-t-fg1 mt-2">
        {loading ? <span className="inline-block w-12 h-5 rounded bg-t-bg4 animate-pulse" /> : value}
      </p>
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, description }: { to: string; icon: typeof Users; title: string; description: string }) {
  return (
    <Link to={to} className="border border-t-stroke3 hover:border-t-stroke-brand rounded-fluent px-4 py-3 bg-t-bg2 hover:bg-t-bg1 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-fluent bg-t-bg-brand-selected flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-t-fg-brand" />
        </div>
        <div className="min-w-0">
          <p className="text-body1 font-semibold text-t-fg1">{title}</p>
          <p className="text-caption1 text-t-fg3 mt-0.5">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function HealthRow({ ok, title, detail, to }: { ok: boolean; title: string; detail: string; to: string }) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-fluent hover:bg-t-bg2 px-2 py-2">
      <span className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${ok ? 'bg-t-success' : 'bg-t-warning'}`} />
      <span className="min-w-0">
        <span className="block text-body1 font-semibold text-t-fg1">{title}</span>
        <span className="block text-caption1 text-t-fg3">{detail}</span>
      </span>
    </Link>
  );
}
