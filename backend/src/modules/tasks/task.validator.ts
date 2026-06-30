import { z } from 'zod';

const TaskStatusEnum   = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// POST /api/tasks
export const createTaskSchema = z.object({
  body: z
    .object({
      title:       z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
      projectId:   z.number({ required_error: 'projectId is required' }).int().positive(),
      description: z.string().trim().max(5000).optional(),
      status:      TaskStatusEnum.optional(),
      priority:    TaskPriorityEnum.optional(),
      dueDate:     z.string().datetime().optional(),
      assigneeId:  z.number().int().positive().optional(),
      labels:      z.array(z.string().trim().max(50)).max(10).optional(),
    })
    .strict(),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

// PATCH /api/tasks/:id — all fields optional
export const updateTaskSchema = z.object({
  body: z
    .object({
      title:       z.string().trim().min(3).max(150).optional(),
      description: z.string().trim().max(5000).optional(),
      status:      TaskStatusEnum.optional(),
      priority:    TaskPriorityEnum.optional(),
      dueDate:     z.string().datetime().optional().nullable(),
      assigneeId:  z.number().int().positive().optional().nullable(),
      labels:      z.array(z.string().trim().max(50)).max(10).optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' }),
  query:  z.object({}).optional(),
  params: z.object({ id: z.string() }),
});

// PATCH /api/tasks/bulk
export const bulkUpdateSchema = z.object({
  body: z
    .object({
      ids:    z.array(z.number().int().positive()).min(1, 'ids must have at least one item').max(100),
      status: TaskStatusEnum,
    })
    .strict(),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

// Query params for GET /api/projects/:id/tasks
export const listTasksQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string() }),
  query: z.object({
    status:     TaskStatusEnum.optional(),
    priority:   TaskPriorityEnum.optional(),
    assigneeId: z.string().optional(),
    search:     z.string().trim().max(200).optional(),
    sortBy:     z.enum(['dueDate', 'priority', 'createdAt', 'updatedAt']).optional(),
    order:      z.enum(['asc', 'desc']).optional(),
    page:       z.string().optional(),
    limit:      z.string().optional(),
  }),
});

// POST /api/tasks/:id/comments
export const addCommentSchema = z.object({
  body: z
    .object({
      text: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
    })
    .strict(),
  query:  z.object({}).optional(),
  params: z.object({ id: z.string() }),
});

export type CreateTaskInput   = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput   = z.infer<typeof updateTaskSchema>['body'];
export type BulkUpdateInput   = z.infer<typeof bulkUpdateSchema>['body'];
export type ListTasksQuery    = z.infer<typeof listTasksQuerySchema>['query'];
