/* eslint-disable react-refresh/only-export-components */
import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useState, type ReactNode,
} from 'react';
import { authApi } from '@/api';
import type { PublicUser } from '@/lib/types';
import type { LoginInput, RegisterInput } from '@/lib/validators';

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
  const [user,      setUser]      = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on first mount
  useEffect(() => {
    authApi.getCurrentUser()
      .then(setUser)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user: next } = await authApi.login(input);
    setUser(next);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: next } = await authApi.register(input);
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, isLoading, isAuthenticated: Boolean(user),
    login, register, logout, setUser,
  }), [user, isLoading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
