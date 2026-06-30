import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.use(requireAuth);

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getSummary);

export default router;
