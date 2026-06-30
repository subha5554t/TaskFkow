import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      name:            z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
      email:           z.string().trim().email('Enter a valid email address').toLowerCase(),
      password:        z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path:    ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email:    z.string().trim().email('Enter a valid email address').toLowerCase(),
      password: z.string().min(1, 'Password is required'),
    })
    .strict(),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match.',
      path:    ['confirmPassword'],
    }),
});

export type RegisterBody       = z.infer<typeof registerSchema>['body'];
export type LoginBody          = z.infer<typeof loginSchema>['body'];
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>['body'];
