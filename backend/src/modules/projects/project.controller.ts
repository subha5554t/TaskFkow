import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as projectService from './project.service';

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await projectService.listProjects(req.user.id, page, limit);
  res.json({ success: true, data: result.projects, pagination: result.pagination });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.user.id, req.body);
  res.status(201).json({ success: true, data: project });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProject(Number(req.params.id), req.user.id);
  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(
    Number(req.params.id),
    req.user.id,
    req.body,
  );
  res.json({ success: true, data: project });
});

export const archiveProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.archiveProject(Number(req.params.id), req.user.id);
  res.status(204).send();
});
