import { useState } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/router';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.role
      );
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Inscription</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Mot de passe (min 6 caractères):
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
            Confirmer le mot de passe:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '5px' }}>
            Rôle:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="CANDIDATE">Candidat</option>
            <option value="RECRUITER">Recruteur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Déjà un compte? <a href="/login" style={{ color: '#007bff' }}>Se connecter</a>
      </p>
    </div>
  );
}
