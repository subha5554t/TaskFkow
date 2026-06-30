/* eslint-disable react-refresh/only-export-components */
import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useState, type ReactNode,
} from 'react';
import { authApi } from '@/api';
import type { PublicUser } from '@/lib/types';
import type { LoginInput, RegisterInput } from '@/lib/validators';

const TOKEN_KEY = 'taskflow:token';
const USER_KEY  = 'taskflow:user';

interface AuthContextValue {
  user:            PublicUser | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:           (input: LoginInput)    => Promise<void>;
  register:        (input: RegisterInput) => Promise<void>;
  logout:          () => void;
  setUser:         (user: PublicUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUserState] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first mount: if a token exists, fetch the current user from the real backend.
  // This keeps the session alive across page reloads.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi.getCurrentUser()
      .then((u) => setUserState(u))
      .catch(() => {
        // Token is expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setUser = useCallback((u: PublicUser) => {
    setUserState(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user: next, token } = await authApi.login(input);
    // Persist the JWT so the axios client attaches it to every subsequent request
    localStorage.setItem(TOKEN_KEY, token);
    setUser(next);
  }, [setUser]);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: next, token } = await authApi.register(input);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(next);
  }, [setUser]);

  const logout = useCallback(() => {
    authApi.logout();   // clears localStorage
    setUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, isLoading, isAuthenticated: Boolean(user),
    login, register, logout, setUser,
  }), [user, isLoading, login, register, logout, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
