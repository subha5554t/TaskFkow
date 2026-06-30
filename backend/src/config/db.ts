import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Single PrismaClient instance for the whole process.
// Instantiating multiple clients causes connection pool exhaustion under load.
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
