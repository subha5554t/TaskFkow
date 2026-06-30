import { z } from 'zod';

// PATCH /api/users/me — both fields optional, but at least one must be present
export const updateProfileSchema = z.object({
  body: z
    .object({
      name:  z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
      email: z.string().trim().email('Invalid email address').max(254).optional(),
    })
    .strict()
    .refine((data) => data.name !== undefined || data.email !== undefined, {
      message: 'At least one field (name or email) is required',
    }),
  query:  z.object({}).optional(),
  params: z.object({}).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
