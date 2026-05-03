import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { postJson } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

type RegisterResponse = {
  token: string;
  role: string;
  userId?: string;
  recruiterId?: string;
  companyId?: string;
  onboardingCompleted?: boolean;
};

export default function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('Technologie');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pwdChecks = [
    { ok: password.length >= 8, label: 'Au moins 8 caracteres' },
    { ok: /[A-Z]/.test(password), label: 'Une majuscule' },
    { ok: /[0-9]/.test(password), label: 'Un chiffre' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!pwdChecks.every((c) => c.ok)) {
      setError('Le mot de passe ne respecte pas les criteres.');
      return;
    }

    setLoading(true);

    try {
      const data = await postJson<RegisterResponse>('/api/auth/register-company-owner', {
        fullName,
        companyName: company,
        sector,
        size: 'PME', // Valeur par défaut
        website: '', // Champ site web supprimé
        plan: 'starter',
        email,
        password,
        confirmPassword: password,
      });

      signIn({
        token: data.token,
        user: {
          email,
          role: data.role,
          userId: data.userId || null,
          recruiterId: data.recruiterId || null,
          companyId: data.companyId || null,
          // Le setup entreprise est obligatoire dans PR2 meme si le backend marque deja true.
          onboardingCompleted: false,
          user_metadata: {
            full_name: fullName,
          },
        },
      });

      setSuccess(true);
      setTimeout(() => navigate('/entreprise/setup'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation du compte.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-t-bg3 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-t-success mx-auto mb-4" />
          <h1 className="text-subtitle1 font-semibold text-t-fg1">Compte cree avec succes</h1>
          <p className="text-caption1 text-t-fg3 mt-2">Redirection vers votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-t-bg3 flex items-start justify-center px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-fluent bg-t-brand-80 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-subtitle1 font-semibold text-t-fg1">Creer un compte</h1>
          <p className="text-caption1 text-t-fg3 mt-1">Commencez a structurer vos recrutements</p>
        </div>

        <div className="bg-t-bg1 border border-t-stroke2 rounded-fluent-lg px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
                {error}
              </div>
            )}

            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jean Dupont"
                className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>

            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Entreprise</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="Nom de votre entreprise"
                className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>

            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Secteur</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors"
              >
                <option value="Technologie">Technologie</option>
                <option value="Finance">Finance</option>
                <option value="Sante">Sante</option>
                <option value="Industrie">Industrie</option>
                <option value="Conseil">Conseil</option>
                <option value="Autre">Autre</option>
              </select>
            </div>


            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@entreprise.com"
                className="w-full h-9 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
              />
            </div>

            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 caracteres"
                  className="w-full h-9 px-3 pr-9 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-t-fg3 hover:text-t-fg2 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {pwdChecks.map((c) => (
                    <span key={c.label} className={`text-caption2 inline-flex items-center gap-1 ${c.ok ? 'text-t-success' : 'text-t-fg-disabled'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 text-body1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-50 rounded-fluent inline-flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Creer mon compte
            </button>
          </form>
        </div>

        <p className="text-center text-caption1 text-t-fg3 mt-4">
          Deja un compte ?{' '}
          <Link to="/login" className="text-t-fg-brand hover:underline font-semibold">Se connecter</Link>
        </p>

        <p className="text-center mt-6">
          <Link to="/landing" className="text-caption1 text-t-fg3 hover:text-t-fg2 transition-colors">
            ← Retour a l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
