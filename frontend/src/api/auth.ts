// Auth API — mock localStorage-backed implementation
// When the real backend is ready: replace function bodies with axios calls.
// Nothing outside this file touches the store directly.

import { getDb, commit, sessionStore, uid, delay, now } from '@/lib/store';
import { ApiError } from '@/lib/apiError';
import type { PublicUser } from '@/lib/types';
import type { LoginInput, RegisterInput } from '@/lib/validators';

export async function login(input: LoginInput): Promise<{ user: PublicUser }> {
  const db   = getDb();
  const user = Object.values(db.users).find(u => u.email === input.email);

  // Simulate a short network delay
  await delay(null, 300);

  // For demo purposes: accept any password for existing users
  if (!user) throw new ApiError(401, 'No account found with that email');

  sessionStore.save(`mock_token_${user.id}`, user.id);
  const { passwordHash: _, ...pub } = user;
  return { user: pub };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser }> {
  const db = getDb();
  await delay(null, 300);

  if (Object.values(db.users).find(u => u.email === input.email)) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const id = uid('user');
  const newUser = {
    id, name: input.name, email: input.email,
    passwordHash: 'hashed', // mock — real backend uses bcrypt
    createdAt: now(), updatedAt: now(),
  };

  commit(db => { db.users[id] = newUser; });
  sessionStore.save(`mock_token_${id}`, id);

  const { passwordHash: _, ...pub } = newUser;
  return { user: pub };
}

export async function logout(): Promise<void> {
  sessionStore.clear();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const userId = sessionStore.getUserId();
  if (!userId) return null;
  const db   = getDb();
  const user = db.users[userId];
  if (!user) return null;
  const { passwordHash: _, ...pub } = user;
  return pub;
}

export async function updateProfile(
  data: { name: string; email: string },
): Promise<PublicUser> {
  const userId = sessionStore.getUserId();
  if (!userId) throw new ApiError(401, 'Not authenticated');
  await delay(null, 200);

  const db = commit(db => {
    db.users[userId] = { ...db.users[userId], ...data, updatedAt: now() };
  });
  const { passwordHash: _, ...pub } = db.users[userId];
  return pub;
}
