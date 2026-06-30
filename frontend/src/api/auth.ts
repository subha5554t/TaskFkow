
import api from './client';
import type { PublicUser } from '@/lib/types';
import type { LoginInput, RegisterInput } from '@/lib/validators';

interface AuthResponse {
  success: boolean;
  data: {
    user:  PublicUser;
    token: string;
  };
}

interface UserResponse {
  success: boolean;
  data: PublicUser;
}

// Map database models to UI types.
function normaliseUser(raw: any): PublicUser {
  return {
    id:        String(raw.id),
    name:      raw.name,
    email:     raw.email,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const res = await api.post<AuthResponse>('/auth/login', input);
  const { user, token } = res.data.data;
  return { user: normaliseUser(user), token };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
  const res = await api.post<AuthResponse>('/auth/register', input);
  const { user, token } = res.data.data;
  return { user: normaliseUser(user), token };
}

export async function logout(): Promise<void> {
  // JWT is stateless — just remove it client-side.
  // No server call needed for MVP (future: a token blocklist endpoint).
  localStorage.removeItem('taskflow:token');
  localStorage.removeItem('taskflow:user');
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  try {
    const res = await api.get<UserResponse>('/users/me');
    return normaliseUser(res.data.data);
  } catch {
    return null;
  }
}

export async function updateProfile(
  data: { name?: string; email?: string },
): Promise<PublicUser> {
  const res = await api.patch<UserResponse>('/users/me', data);
  return normaliseUser(res.data.data);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword });
}
