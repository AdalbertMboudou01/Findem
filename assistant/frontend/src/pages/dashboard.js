import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.push('/login');
      return;
    }

    const role = authService.getUserRole();
    setUserRole(role);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!authService.isLoggedIn()) {
    return <div>Redirection vers la page de connexion...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Tableau de bord</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Déconnexion
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Bienvenue !</h2>
        <p>Vous êtes connecté en tant que: <strong>{userRole}</strong></p>
      </div>

      {userRole === 'RECRUITER' && (
        <div style={{ backgroundColor: '#e7f3ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Menu Recruteur</h3>
          <ul>
            <li>Gérer les offres d'emploi</li>
            <li>Consulter les candidatures</li>
            <li>Analyser les profils GitHub</li>
          </ul>
        </div>
      )}

      {userRole === 'CANDIDATE' && (
        <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Menu Candidat</h3>
          <ul>
            <li>Consulter les offres d'emploi</li>
            <li>Postuler aux offres</li>
            <li>Gérer mon profil</li>
          </ul>
        </div>
      )}

      {userRole === 'ADMIN' && (
        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Menu Administrateur</h3>
          <ul>
            <li>Gérer les utilisateurs</li>
            <li>Superviser les candidatures</li>
            <li>Configuration du système</li>
          </ul>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
