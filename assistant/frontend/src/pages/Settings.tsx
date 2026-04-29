import { Moon, Sun, Monitor, User, Mail, Phone, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { useTheme } from '../lib/ThemeContext';
import { bootstrapTestCompany } from '../lib/domainApi';

type ThemeOption = 'light' | 'dark' | 'system';

const options: { value: ThemeOption; label: string; desc: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', desc: 'Interface lumineuse', icon: Sun },
  { value: 'dark', label: 'Sombre', desc: 'Interface sombre, repose les yeux', icon: Moon },
  { value: 'system', label: 'Systeme', desc: 'Suit les preferences de votre appareil', icon: Monitor },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem('assistant.theme');
  const activeOption: ThemeOption = stored === 'dark' || stored === 'light' ? stored : 'system';

  function handleSelect(value: ThemeOption) {
    if (value === 'system') {
      localStorage.removeItem('assistant.theme');
      setTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setTheme(value);
    }
  }

  async function handleBootstrapTestCompany() {
    try {
      setBootstrapLoading(true);
      setBootstrapError(null);
      setBootstrapMessage(null);

      const result = await bootstrapTestCompany();
      const companyLabel = result.companyName ? ` (${result.companyName})` : '';
      setBootstrapMessage(
        result.created
          ? `Entreprise de test creee${companyLabel}.`
          : `Entreprise de test deja liee a votre compte${companyLabel}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de preparer l\'entreprise de test.';
      setBootstrapError(message);
    } finally {
      setBootstrapLoading(false);
    }
  }

  async function handlePasswordChange() {
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('Tous les champs sont obligatoires');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        setPasswordError('Le nouveau mot de passe doit être différent de l\'ancien');
        return;
      }

      // Appel API
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        },
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();

      if (response.ok) {
        setPasswordSuccess('Mot de passe changé avec succès');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(result.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      setPasswordError('Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <>
      <TopBar title="Parametres" subtitle="Preferences utilisateur et mode test" />
      <div className="flex-1 overflow-y-auto bg-t-bg3 px-4 py-6">
        <div className="max-w-[600px] mx-auto space-y-6">

          {/* Profil utilisateur */}
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Profil utilisateur</h2>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Nom complet</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="votre.email@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                <div>
                  <label className="block text-caption1 font-medium text-t-fg2 mb-2">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-t-bg4 border-2 border-t-stroke2 flex items-center justify-center">
                      <User className="w-8 h-8 text-t-fg3" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <button className="inline-flex items-center gap-2 px-3 py-2 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover">
                        <Camera className="w-4 h-4" />
                        Prendre une photo
                      </button>
                      <button className="inline-flex items-center gap-2 px-3 py-2 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover">
                        <Mail className="w-4 h-4" />
                        Importer depuis email
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-4 py-2 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover">
                    Annuler
                  </button>
                  <button className="px-4 py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Apparence */}
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Apparence</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-caption1 text-t-fg3">Choisissez le theme de l'interface.</p>
              <div className="grid grid-cols-3 gap-3">
                {options.map(({ value, label, desc, icon: Icon }) => {
                  const selected = activeOption === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(value)}
                      className={`flex flex-col items-center gap-2 px-3 py-4 rounded-fluent-lg border-2 transition-colors text-center ${
                        selected
                          ? 'border-t-stroke-brand bg-t-bg-brand-selected'
                          : 'border-t-stroke2 bg-t-bg2 hover:bg-t-bg1-hover'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          selected ? 'bg-t-bg-brand text-white' : 'bg-t-bg4 text-t-fg3'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-caption1 font-semibold ${selected ? 'text-t-fg-brand' : 'text-t-fg1'}`}>
                        {label}
                      </span>
                      <span className="text-caption2 text-t-fg3 leading-tight">{desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Apercu du theme actif */}
              <div className="mt-2 flex items-center gap-2 text-caption2 text-t-fg3">
                <span>Theme actif :</span>
                <span className="font-semibold text-t-fg2">{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Sécurité</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover"
              >
                <div className="flex items-center justify-between">
                  <span>Changer le mot de passe</span>
                  <span className="text-caption2 text-t-fg3">Dernier changement : il y a 30 jours</span>
                </div>
              </button>
            </div>
          </section>

          <section className="bg-t-bg1 border border-t-stroke3 rounded-fluent-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-t-stroke3">
              <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Mode test</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-caption1 text-t-fg3">
                Cree ou rattache une entreprise fictive a votre compte connecte pour tester rapidement les ecrans metier.
              </p>
              <button
                onClick={handleBootstrapTestCompany}
                disabled={bootstrapLoading}
                className="inline-flex items-center justify-center rounded-fluent px-4 py-2 text-caption1 font-semibold bg-t-bg-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {bootstrapLoading ? 'Preparation en cours...' : 'Creer / rattacher mon entreprise de test'}
              </button>

              {bootstrapMessage ? <p className="text-caption1 text-green-600">{bootstrapMessage}</p> : null}
              {bootstrapError ? <p className="text-caption1 text-red-600">{bootstrapError}</p> : null}
            </div>
          </section>

        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-t-bg1 rounded-fluent-lg border border-t-stroke3 max-w-md w-full">
            <div className="px-5 py-4 border-b border-t-stroke3 flex items-center justify-between">
              <h3 className="text-caption1 font-semibold text-t-fg1">Changer le mot de passe</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-t-fg3 hover:text-t-fg1"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {passwordError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-fluent text-caption1 text-red-600">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-fluent text-caption1 text-green-600">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-caption1 font-medium text-t-fg2 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>

              <div>
                <label className="block text-caption1 font-medium text-t-fg2 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                  placeholder="Minimum 8 caractères"
                />
              </div>

              <div>
                <label className="block text-caption1 font-medium text-t-fg2 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                  placeholder="Répétez le nouveau mot de passe"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-t-stroke3 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 text-caption1 font-medium rounded-fluent border border-t-stroke2 bg-t-bg2 text-t-fg1 hover:bg-t-bg1-hover"
              >
                Annuler
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                className="px-4 py-2 text-caption1 font-semibold rounded-fluent bg-t-brand text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
