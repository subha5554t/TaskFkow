import rateLimit from 'express-rate-limit';

// Prevents brute-force attacks without blocking legitimate users.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Try again in 15 minutes.',
  },
});

// Prevents flooding and runaway clients while leaving normal usage unrestricted.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
