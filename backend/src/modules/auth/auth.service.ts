import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { RegisterBody, LoginBody, ChangePasswordBody } from './auth.validator';

// Strip passwordHash so it never accidentally leaks to the client.
function toPublicUser(user: { id: number; name: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id:        user.id,
    name:      user.name,
    email:     user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(userId: number, email: string): string {
  return jwt.sign(
    { id: userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

export async function register(body: RegisterBody) {
  // Checking for duplicates here lets us return a clean 409 instead of catching a generic Prisma error.
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name:         body.name,
      email:        body.email,
      passwordHash,
    },
  });

  const token = signToken(user.id, user.email);
  return { user: toPublicUser(user), token };
}

export async function login(body: LoginBody) {
  // Always run bcrypt.compare even when user is not found to prevent timing attacks
  const user = await prisma.user.findUnique({ where: { email: body.email } });

  const dummyHash   = '$2b$10$invalidhashpaddingtomatchbcrypttiming000000000000000000000';
  const hashToCheck = user?.passwordHash ?? dummyHash;
  const valid       = await bcrypt.compare(body.password, hashToCheck);

  if (!user || !valid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user.id, user.email);
  return { user: toPublicUser(user), token };
}

export async function changePassword(userId: number, body: ChangePasswordBody) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found.');

  const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  const newHash = await bcrypt.hash(body.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data:  { passwordHash: newHash },
  });

  return { message: 'Password updated successfully.' };
}
