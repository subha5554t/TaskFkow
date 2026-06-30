import { z } from 'zod';

// ── Auth validators ────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ── Project validators ─────────────────────────────────────
export const projectSchema = z.object({
  name:        z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  dueDate:     z.string().optional(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// ── Task validators ────────────────────────────────────────
export const taskSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().optional(),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate:     z.string().optional(),
  assigneeId:  z.string().optional(),
});
export type TaskInput = z.infer<typeof taskSchema>;

// ── Comment validators ─────────────────────────────────────
export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(1000),
});
export type CommentInput = z.infer<typeof commentSchema>;

// ── Profile update ─────────────────────────────────────────
export const profileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
});
export type ProfileInput = z.infer<typeof profileSchema>;
