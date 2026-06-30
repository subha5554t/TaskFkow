import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  bulkUpdateSchema,
  listTasksQuerySchema,
  addCommentSchema,
} from './task.validator';
import * as taskController from './task.controller';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/projects/:id/tasks', validate(listTasksQuerySchema), taskController.listTasks);

router.patch('/bulk', validate(bulkUpdateSchema), taskController.bulkUpdateTasks);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

router.get('/:id/comments', taskController.listComments);
router.post('/:id/comments', validate(addCommentSchema), taskController.addComment);
router.get('/:id/activity', taskController.listActivity);

export default router;
