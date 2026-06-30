import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateProfileSchema } from './user.validator';
import * as userController from './user.controller';

const router = Router();

// All user routes require a valid JWT
router.use(requireAuth);

// GET  /api/users/me
router.get('/me', userController.getMe);

// PATCH /api/users/me
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

// GET  /api/projects/:id/members  — registered here because it returns user data,
//  but mounted via app.ts under /api/users so it stays in the users module
router.get('/projects/:id/members', userController.getProjectMembers);

export default router;
