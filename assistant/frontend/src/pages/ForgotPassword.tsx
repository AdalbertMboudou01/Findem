import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'confirm' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/password-reset/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Email de réinitialisation envoyé avec succès');
        // Pour le développement, on passe directement à l'étape de confirmation avec le token
        if (result.resetToken) {
          setToken(result.resetToken);
          setStep('confirm');
        }
      } else {
        setError(result.message || 'Erreur lors de la demande');
      }
    } catch (e) {
      setError('Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Tous les champs sont obligatoires');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe réinitialisé avec succès');
        setStep('success');
      } else {
        setError(result.message || 'Erreur lors de la réinitialisation');
      }
    } catch (e) {
      setError('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-t-bg3 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-t-stroke3">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-caption1 text-t-fg3 hover:text-t-fg1 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-t-bg-brand flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-body1 font-semibold text-t-fg1">
                {step === 'request' && 'Mot de passe oublié'}
                {step === 'confirm' && 'Réinitialiser le mot de passe'}
                {step === 'success' && 'Succès'}
              </h1>
            </div>
            <p className="text-caption1 text-t-fg3">
              {step === 'request' && 'Entrez votre email pour recevoir un lien de réinitialisation'}
              {step === 'confirm' && 'Entrez votre nouveau mot de passe'}
              {step === 'success' && 'Votre mot de passe a été réinitialisé avec succès'}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-fluent text-caption1 text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && step !== 'success' && (
              <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-fluent text-caption1 text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                      placeholder="votre.email@entreprise.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>
            )}

            {step === 'confirm' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Token de réinitialisation</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Collez le token reçu par email"
                    required
                  />
                  <p className="text-caption2 text-t-fg3 mt-1">
                    Le token a été envoyé à votre email
                  </p>
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Minimum 8 caractères"
                    required
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Répétez le mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-body1 text-t-fg1">
                  Votre mot de passe a été réinitialisé avec succès
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-caption2 text-t-fg3">
            Besoin d'aide ?{' '}
            <a href="#" className="text-t-fg2 hover:underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
