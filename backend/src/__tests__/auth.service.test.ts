import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

jest.mock('../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../config/env', () => ({
  env: { JWT_SECRET: 'test-secret', JWT_EXPIRES_IN: '7d' },
}));

import prisma from '../config/db';
import * as authService from '../modules/auth/auth.service';

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock    = jwt    as jest.Mocked<typeof jwt>;
const prismaMock = prisma as jest.Mocked<typeof prisma>;

const fakeUser = {
  id:           1,
  name:         'Alice',
  email:        'alice@example.com',
  passwordHash: 'hashed-password',
  createdAt:    new Date(),
  updatedAt:    new Date(),
};

describe('auth.service — register', () => {
  it('returns user and token on success', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.user.create    as jest.Mock).mockResolvedValue(fakeUser);
    (bcryptMock.hash           as jest.Mock).mockResolvedValue('hashed-password');
    (jwtMock.sign              as jest.Mock).mockReturnValue('signed-token');

    const result = await authService.register({
      name:            'Alice',
      email:           'alice@example.com',
      password:        'password123',
      confirmPassword: 'password123',
    });

    expect(result.token).toBe('signed-token');
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('throws 409 when email already exists', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

    await expect(
      authService.register({
        name:            'Alice',
        email:           'alice@example.com',
        password:        'password123',
        confirmPassword: 'password123',
      }),
    ).rejects.toThrow(new ApiError(409, 'An account with that email already exists.'));
  });
});

describe('auth.service — login', () => {
  it('returns user and token with correct credentials', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (bcryptMock.compare         as jest.Mock).mockResolvedValue(true);
    (jwtMock.sign               as jest.Mock).mockReturnValue('signed-token');

    const result = await authService.login({
      email:    'alice@example.com',
      password: 'password123',
    });

    expect(result.token).toBe('signed-token');
    expect(result.user.email).toBe('alice@example.com');
  });

  it('throws 401 with wrong password', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (bcryptMock.compare         as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({ email: 'alice@example.com', password: 'wrongpass' }),
    ).rejects.toThrow(new ApiError(401, 'Invalid email or password.'));
  });

  it('throws 401 when email not found', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    (bcryptMock.compare         as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'wrongpass' }),
    ).rejects.toThrow(new ApiError(401, 'Invalid email or password.'));
  });
});

describe('auth.service — changePassword', () => {
  it('throws 404 when user does not exist', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.changePassword(999, {
        currentPassword: 'old',
        newPassword:     'newpass123',
        confirmPassword: 'newpass123',
      }),
    ).rejects.toThrow(new ApiError(404, 'User not found.'));
  });

  it('throws 401 when current password is wrong', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (bcryptMock.compare         as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.changePassword(1, {
        currentPassword: 'wrongpass',
        newPassword:     'newpass123',
        confirmPassword: 'newpass123',
      }),
    ).rejects.toThrow(new ApiError(401, 'Current password is incorrect.'));
  });
});
