import { createContext, useContext, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'assistant.auth';

type UserMetadata = {
  full_name?: string;
};

type AuthUser = {
  email: string;
  role: string;
  user_metadata?: UserMetadata;
};

type StoredAuth = {
  token: string;
  user: AuthUser;
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (payload: StoredAuth) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const auth = JSON.parse(raw) as StoredAuth;
      if (auth?.token && auth?.user) {
        setToken(auth.token);
        setUser(auth.user);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    setLoading(false);
  }, []);

  function signIn(payload: StoredAuth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    setToken(payload.token);
    setUser(payload.user);
  }

  async function signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
