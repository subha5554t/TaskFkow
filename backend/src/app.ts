import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import prisma from './config/db';
import logger from './utils/logger';
import { generalLimiter, authLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

import authRoutes      from './modules/auth/auth.routes';
import userRoutes      from './modules/users/user.routes';
import projectRoutes   from './modules/projects/project.routes';
import taskRoutes      from './modules/tasks/task.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:      env.CLIENT_URL,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success:   true,
      status:    'ok',
      db:        'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      success:   false,
      status:    'error',
      db:        'unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api', generalLimiter);

app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
