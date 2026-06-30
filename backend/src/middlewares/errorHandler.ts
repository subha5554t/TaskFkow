import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

// Map known Prisma codes to safe HTTP responses so raw schema internals never leak to the client.
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'A record with that value already exists.' },
  P2025: { status: 404, message: 'Record not found.'                        },
  P2003: { status: 400, message: 'Invalid reference — related record does not exist.' },
  P2014: { status: 400, message: 'Invalid relation — the change would violate a required relation.' },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {

  const prismaCode = (err as Error & { code?: string }).code;
  if (prismaCode && PRISMA_ERROR_MAP[prismaCode]) {
    const mapped = PRISMA_ERROR_MAP[prismaCode];
    res.status(mapped.status).json({ success: false, message: mapped.message });
    return;
  }


  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors !== undefined && { errors: err.errors }),
    });
    return;
  }

  // Log unhandled errors fully but only return generic message to client to prevent leaks
  logger.error({
    err,
    path:   req.path,
    method: req.method,
    body:   req.body,
  });

  res.status(500).json({ success: false, message: 'Internal server error.' });
};
