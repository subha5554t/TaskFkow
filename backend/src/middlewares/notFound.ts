import { Request, Response } from 'express';

// Catches all unmatched routes and returns a consistent 404 response.
// Must be registered after all valid route handlers.
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'The requested resource does not exist.',
  });
};
