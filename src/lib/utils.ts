/**
 * @file lib/utils.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Shared utility functions: Tailwind class merging, date formatting,
 *   rank score calculation, slug generation, currency formatting, and
 *   API error extraction.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isAfter } from 'date-fns'
import { RANK_WEIGHTS } from '@/constants'
import type { Ad } from '@/types'

// ─── Tailwind class merging ───────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isExpired(expireAt: string | null | undefined): boolean {
  if (!expireAt) return false
  return !isAfter(new Date(expireAt), new Date())
}

// ─── Currency formatting ──────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ur-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Rank score calculation ───────────────────────────────────────────────────
/**
 * Calculates the rank score for an ad based on the formula:
 * score = (featured ? 50 : 0) + (packageWeight * 10) + freshnessPoints + adminBoost + verifiedSellerPoints
 */
export function calculateRankScore(ad: {
  is_featured: boolean
  admin_boost: number
  created_at: string
  package?: { weight: number } | null
  seller?: { is_verified: boolean } | null
}): number {
  const { FEATURED_BONUS, PACKAGE_MULTIPLIER, FRESHNESS_MAX_POINTS, VERIFIED_SELLER_BONUS } =
    RANK_WEIGHTS

  const featuredBonus = ad.is_featured ? FEATURED_BONUS : 0
  const packageScore = (ad.package?.weight ?? 1) * PACKAGE_MULTIPLIER

  // Freshness: 20 points if published < 1 hour ago, decaying over 7 days
  const hoursOld =
    (Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60)
  const freshnessScore = Math.max(0, FRESHNESS_MAX_POINTS - hoursOld / 8.4)

  const verifiedBonus = ad.seller?.is_verified ? VERIFIED_SELLER_BONUS : 0

  return +(featuredBonus + packageScore + freshnessScore + ad.admin_boost + verifiedBonus).toFixed(2)
}

// ─── Slug generation ──────────────────────────────────────────────────────────
export function generateSlug(title: string, id?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return id ? `${base}-${id.slice(0, 8)}` : base
}

// ─── Truncate text ────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// ─── Extract API error message ────────────────────────────────────────────────
export function getApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string }
    return axiosError.response?.data?.message ?? axiosError.message ?? 'Something went wrong'
  }
  return 'Something went wrong'
}

// ─── Initials for avatar ──────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
