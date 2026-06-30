/* eslint-disable no-console */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:       z.enum(['development', 'production', 'test']).default('development'),
  PORT:           z.string().default('3000'),
  DATABASE_URL:   z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET:     z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL:     z.string().url('CLIENT_URL must be a valid URL'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('');
  console.error('Missing or invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  console.error('');
  console.error('Copy .env.example to .env and fill in the missing values.');
  console.error('');
  process.exit(1);
}

export const env = parsed.data;
