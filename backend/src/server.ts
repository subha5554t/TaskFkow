import app from './app';
import { env } from './config/env';
import prisma from './config/db';
import logger from './utils/logger';

const PORT = Number(env.PORT);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown — give in-flight requests time to finish before the process dies.
// Railway and Render both send SIGTERM on redeploy. Without this, requests in flight get dropped.
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });

  // Force-kill if graceful shutdown takes too long (e.g., hung DB query)
  setTimeout(() => {
    logger.error('Shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT',  () => void shutdown('SIGINT'));
