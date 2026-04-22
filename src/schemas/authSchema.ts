/**
 * @file schemas/authSchema.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zod validation schemas for registration and login forms.
 *   Used with React Hook Form resolver on the frontend and directly
 *   on API route inputs for consistent server-side validation.
 */

import { z } from 'zod'

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  business_name: z.string().max(150).optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  city: z.string().max(100).optional(),
})

// ─── Exported Types ───────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
