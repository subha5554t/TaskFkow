import 'express';

// Augments the Express Request type so TypeScript knows req.user exists
// after the requireAuth middleware populates it.
// Without this, every controller would need `as any` casts.
declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        email: string;
      };
    }
  }
}
