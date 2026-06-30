import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as taskService from './task.service';
import { ListTasksQuery } from './task.validator';

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listTasks(
    Number(req.params.id),
    req.user.id,
    req.query as unknown as ListTasksQuery,
  );
  res.json({ success: true, data: result.tasks, pagination: result.pagination });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json({ success: true, data: task });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTask(Number(req.params.id), req.user.id);
  res.json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(
    Number(req.params.id),
    req.user.id,
    req.body,
  );
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(Number(req.params.id), req.user.id);
  res.status(204).send();
});

export const bulkUpdateTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.bulkUpdateTasks(req.user.id, req.body);
  res.json({ success: true, data: result });
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await taskService.listComments(Number(req.params.id), req.user.id);
  res.json({ success: true, data: comments });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await taskService.addComment(
    Number(req.params.id),
    req.user.id,
    req.body.text,
  );
  res.status(201).json({ success: true, data: comment });
});

export const listActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await taskService.listActivity(Number(req.params.id), req.user.id);
  res.json({ success: true, data: activity });
});
