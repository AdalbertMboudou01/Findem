import { createContext, useContext, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'assistant.auth';

type UserMetadata = {
  full_name?: string;
};

export type AuthUser = {
  email: string;
  role: string;
  userId?: string | null;
  recruiterId?: string | null;
  companyId?: string | null;
  onboardingCompleted?: boolean;
  user_metadata?: UserMetadata;
};

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (payload: StoredAuth) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  signIn: () => {},
  updateUser: () => {},
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

  function updateUser(patch: Partial<AuthUser>) {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...patch };
      if (token) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: updated }));
      }
      return updated;
    });
  }

  async function signOut() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
