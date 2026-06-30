import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createProjectSchema, updateProjectSchema } from './project.validator';
import * as projectController from './project.controller';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

// GET  /api/projects
router.get('/', projectController.listProjects);

// POST /api/projects
router.post('/', validate(createProjectSchema), projectController.createProject);

// GET  /api/projects/:id
router.get('/:id', projectController.getProject);

// PUT  /api/projects/:id  (owner only — enforced in service)
router.put('/:id', validate(updateProjectSchema), projectController.updateProject);

// DELETE /api/projects/:id  (soft delete → ARCHIVED, owner only)
router.delete('/:id', projectController.archiveProject);

export default router;
