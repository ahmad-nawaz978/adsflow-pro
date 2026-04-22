/**
 * @file schemas/adSchema.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zod schemas for ad creation, editing, and media URL validation.
 *   Shared between frontend React Hook Form and backend API route validation
 *   to ensure consistent rules on both ends.
 */

import { z } from 'zod'

// ─── Media URL Schema ─────────────────────────────────────────────────────────
export const adMediaSchema = z.object({
  original_url: z
    .string()
    .url('Must be a valid URL (https://...)')
    .refine(
      (url) =>
        url.startsWith('https://') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('cloudinary.com') ||
        url.includes('github.com') ||
        url.includes('raw.githubusercontent.com'),
      'URL must be from a supported source (YouTube, GitHub, Cloudinary, or a direct https:// image link)'
    ),
  source_type: z.enum(['image', 'youtube', 'cloudinary']),
})

// ─── Create Ad Schema ─────────────────────────────────────────────────────────
export const createAdSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category_id: z.string().uuid('Please select a valid category'),
  city_id: z.string().uuid('Please select a valid city'),
  package_id: z.string().uuid('Please select a valid package'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be a positive number')
    .optional()
    .nullable(),
  contact_phone: z
    .string()
    .regex(/^[0-9+\-\s]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  media: z
    .array(adMediaSchema)
    .min(1, 'At least one media URL is required')
    .max(5, 'Maximum 5 media items allowed'),
})

// ─── Edit Ad Schema (partial) ─────────────────────────────────────────────────
export const editAdSchema = createAdSchema.partial().extend({
  id: z.string().uuid(),
})

// ─── Moderator Review Schema ──────────────────────────────────────────────────
export const reviewAdSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
})

// ─── Admin Publish Schema ─────────────────────────────────────────────────────
export const publishAdSchema = z.object({
  action: z.enum(['publish', 'schedule', 'reject']),
  publish_at: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional(),
  is_featured: z.boolean().optional(),
  admin_boost: z.number().int().min(0).max(100).optional(),
  note: z.string().max(500).optional(),
})

// ─── Exported Types ───────────────────────────────────────────────────────────
export type CreateAdInput = z.infer<typeof createAdSchema>
export type EditAdInput = z.infer<typeof editAdSchema>
export type ReviewAdInput = z.infer<typeof reviewAdSchema>
export type PublishAdInput = z.infer<typeof publishAdSchema>
