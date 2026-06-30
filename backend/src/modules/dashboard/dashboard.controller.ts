import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as dashboardService from './dashboard.service';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getSummary(req.user.id);
  res.json({ success: true, data });
});
