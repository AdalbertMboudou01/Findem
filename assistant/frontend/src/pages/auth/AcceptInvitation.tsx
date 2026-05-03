import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock, UserPlus } from 'lucide-react';
import { acceptCompanyInvitation, loadInvitationByToken, type CompanyInvitation } from '../../lib/domainApi';
import { useAuth } from '../../lib/AuthContext';

export default function AcceptInvitation() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [invitation, setInvitation] = useState<CompanyInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadInvitationByToken(token);
        if (!mounted) return;
        setInvitation(data);
        if (data.status !== 'PENDING') {
          setError("Cette invitation n'est plus active.");
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Invitation introuvable.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Votre nom est obligatoire.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setSubmitting(true);
      const auth = await acceptCompanyInvitation({
        token,
        fullName: fullName.trim(),
        password,
        confirmPassword,
      });
      signIn({
        token: auth.token,
        user: {
          email: invitation?.email || '',
          role: auth.role,
          userId: auth.userId || null,
          recruiterId: auth.recruiterId || null,
          companyId: auth.companyId || null,
          onboardingCompleted: Boolean(auth.onboardingCompleted),
          user_metadata: { full_name: fullName.trim() },
        },
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'accepter l'invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-t-bg3 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-fluent bg-t-bg-brand flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-subtitle1 font-semibold text-t-fg1">Rejoindre l'entreprise</h1>
          <p className="text-caption1 text-t-fg3 mt-1">
            {invitation?.companyName || 'Invitation FindDem'}
          </p>
        </div>

        <div className="bg-t-bg1 border border-t-stroke2 rounded-fluent-lg px-6 py-6">
          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-caption1 text-t-fg3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </div>
          ) : success ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-11 h-11 text-t-success mx-auto mb-3" />
              <p className="text-body1 font-semibold text-t-fg1">Compte créé</p>
              <p className="text-caption1 text-t-fg3 mt-1">Redirection vers votre espace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {invitation && (
                <div className="px-3 py-3 bg-t-bg2 border border-t-stroke3 rounded-fluent text-caption1 text-t-fg2">
                  Invitation pour <span className="font-semibold">{invitation.email}</span>
                  <br />
                  Rôle : <span className="font-semibold">{invitation.role}</span>
                  {invitation.departmentName ? <> · Service : <span className="font-semibold">{invitation.departmentName}</span></> : null}
                </div>
              )}

              {error && (
                <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Nom complet</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!invitation || invitation.status !== 'PENDING'}
                  className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand disabled:opacity-60"
                  placeholder="Jean Dupont"
                />
              </label>

              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Mot de passe</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!invitation || invitation.status !== 'PENDING'}
                    className="w-full h-9 pl-9 pr-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand disabled:opacity-60"
                    placeholder="Minimum 8 caractères"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-caption1 font-semibold text-t-fg2 mb-1">Confirmer le mot de passe</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!invitation || invitation.status !== 'PENDING'}
                  className="w-full h-9 px-3 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand disabled:opacity-60"
                />
              </label>

              <button
                type="submit"
                disabled={submitting || !invitation || invitation.status !== 'PENDING'}
                className="w-full h-9 bg-t-bg-brand hover:bg-t-bg-brand-hover text-white text-body1 font-semibold rounded-fluent inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer mon accès
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-5">
          <Link to="/login" className="text-caption1 text-t-fg3 hover:text-t-fg2">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
