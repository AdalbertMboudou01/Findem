import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // L'API backend ne fournit pas encore de flux de reset password.
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-t-bg3 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-fluent bg-t-brand-80 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-subtitle1 font-semibold text-t-fg1">Mot de passe oublie</h1>
          <p className="text-caption1 text-t-fg3 mt-1">
            {sent
              ? 'Verifiez votre boite mail'
              : 'Entrez votre email pour recevoir un lien de reinitialisation'
            }
          </p>
        </div>

        <div className="bg-t-bg1 border border-t-stroke2 rounded-fluent-lg px-6 py-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-t-success mx-auto mb-3" />
              <p className="text-body1 text-t-fg1 font-semibold mb-1">Email envoye</p>
              <p className="text-caption1 text-t-fg3">
                Cette fonctionnalite sera activee a la prochaine etape backend. Pour le moment, contactez un administrateur pour reinitialiser le mot de passe de <span className="font-semibold text-t-fg2">{email}</span>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-4 text-caption1 text-t-fg-brand hover:underline font-semibold"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-red-200 rounded-fluent">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 text-body1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-50 rounded-fluent inline-flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Envoyer le lien
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-4">
          <Link to="/login" className="text-caption1 text-t-fg3 hover:text-t-fg2 inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Retour a la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
