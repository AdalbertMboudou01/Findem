import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ApiError, postJson } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

type LoginResponse = {
  token: string;
  role: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await postJson<LoginResponse>('/api/auth/login', { email, password });
      signIn({
        token: data.token,
        user: {
          email,
          role: data.role,
        },
      });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de connexion.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-t-bg3 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-fluent bg-t-brand-80 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-subtitle1 font-semibold text-t-fg1">Se connecter a FinDem</h1>
          <p className="text-caption1 text-t-fg3 mt-1">Accedez a votre espace recruteur</p>
        </div>

        <div className="bg-t-bg1 border border-t-stroke2 rounded-fluent-lg px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-t-stroke2 rounded-fluent">
                {error}
              </div>
            )}

            <div>
              <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
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
                  placeholder="Votre mot de passe"
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
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-caption1 text-t-fg-brand hover:underline">
                Mot de passe oublie ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 text-body1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-50 rounded-fluent inline-flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>

        <p className="text-center text-caption1 text-t-fg3 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-t-fg-brand hover:underline font-semibold">Creer un compte</Link>
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
