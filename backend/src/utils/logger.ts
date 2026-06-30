import pino from 'pino';
import { env } from '../config/env';

// Structured JSON logger. In development, pretty-print for readability.
// In production, plain JSON so log aggregation services (Datadog, Logtail, etc.) can parse it.
const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export default logger;
