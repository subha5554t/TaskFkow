import { z } from 'zod';

// POST /api/projects
export const createProjectSchema = z.object({
  body: z
    .object({
      name:        z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
      description: z.string().trim().max(500).optional(),
      dueDate:     z.string().datetime({ message: 'dueDate must be an ISO 8601 datetime' }).optional(),
    })
    .strict(),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

// PUT /api/projects/:id  — all fields optional, at least one required
export const updateProjectSchema = z.object({
  body: z
    .object({
      name:        z.string().trim().min(3).max(100).optional(),
      description: z.string().trim().max(500).optional(),
      dueDate:     z.string().datetime().optional().nullable(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' }),
  query:  z.object({}).optional(),
  params: z.object({ id: z.string() }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
