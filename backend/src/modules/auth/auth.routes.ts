import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.validator';
import * as authController from './auth.controller';

const router = Router();

// Rate limiting for auth routes is applied at the app level in app.ts (authLimiter)
router.post('/register',         validate(registerSchema),       authController.register);
router.post('/login',            validate(loginSchema),          authController.login);
router.post('/change-password',  requireAuth, validate(changePasswordSchema), authController.changePassword);

export default router;
