/**
 * @file schemas/paymentSchema.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zod validation schemas for payment proof submission and
 *   admin verification actions. Ensures all payment data is sanitized
 *   before storage and duplicate transaction refs are caught early.
 */

import { z } from 'zod'

// ─── Submit Payment Proof ─────────────────────────────────────────────────────
export const submitPaymentSchema = z.object({
  ad_id: z.string().uuid('Invalid ad reference'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    .max(1000000, 'Amount seems too large'),
  method: z.string().min(2, 'Please select a payment method'),
  transaction_ref: z
    .string()
    .min(4, 'Transaction reference is required')
    .max(100, 'Transaction reference too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Transaction reference can only contain letters, numbers, hyphens, and underscores'),
  sender_name: z
    .string()
    .min(2, 'Sender name is required')
    .max(100, 'Sender name too long'),
  screenshot_url: z
    .string()
    .url('Screenshot URL must be a valid URL')
    .optional()
    .or(z.literal('')),
})

// ─── Admin Verify Payment ─────────────────────────────────────────────────────
export const verifyPaymentSchema = z.object({
  action: z.enum(['verify', 'reject']),
  admin_note: z.string().max(500, 'Note too long').optional(),
})

// ─── Exported Types ───────────────────────────────────────────────────────────
export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
