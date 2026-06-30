import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as userService from './user.service';


export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user.id);
  res.json({ success: true, data: user });
});


export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: user });
});


export const getProjectMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await userService.getProjectMembers(
    Number(req.params.id),
    req.user.id,
  );
  res.json({ success: true, data: members });
});
