/**
 * @file constants/index.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Central constants for all app-wide values: roles, ad statuses,
 *   payment methods, API endpoints, pagination limits, rank weights, Tailwind
 *   badge color maps, and app config. Import from here — never hardcode.
 */

import type { AdStatus, Role } from '@/types'

// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  CLIENT: 'client' as Role,
  MODERATOR: 'moderator' as Role,
  ADMIN: 'admin' as Role,
  SUPER_ADMIN: 'super_admin' as Role,
}

// ─── Ad Statuses ──────────────────────────────────────────────────────────────
export const AD_STATUS: Record<string, AdStatus> = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_VERIFIED: 'payment_verified',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
}

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  'Easypaisa',
  'JazzCash',
  'Bank Transfer',
  'HBL Konnect',
  'UBL Omni',
  'Cash',
  'Other',
]

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
}

// ─── Ranking Formula Weights ──────────────────────────────────────────────────
export const RANK_WEIGHTS = {
  FEATURED_BONUS: 50,
  PACKAGE_MULTIPLIER: 10,
  FRESHNESS_MAX_POINTS: 20,
  VERIFIED_SELLER_BONUS: 5,
}

// ─── Media Source Types ───────────────────────────────────────────────────────
export const MEDIA_SOURCE = {
  IMAGE: 'image',
  YOUTUBE: 'youtube',
  CLOUDINARY: 'cloudinary',
} as const

// ─── Status → Tailwind badge classes ─────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border border-gray-200',
  submitted: 'bg-blue-100 text-blue-700 border border-blue-200',
  under_review: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  payment_pending: 'bg-orange-100 text-orange-700 border border-orange-200',
  payment_submitted: 'bg-purple-100 text-purple-700 border border-purple-200',
  payment_verified: 'bg-teal-100 text-teal-700 border border-teal-200',
  scheduled: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  published: 'bg-green-100 text-green-700 border border-green-200',
  expired: 'bg-red-100 text-red-700 border border-red-200',
  archived: 'bg-gray-200 text-gray-500 border border-gray-300',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
}

// ─── Status Human Labels ──────────────────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  payment_pending: 'Payment Pending',
  payment_submitted: 'Payment Submitted',
  payment_verified: 'Payment Verified',
  scheduled: 'Scheduled',
  published: 'Published',
  expired: 'Expired',
  archived: 'Archived',
  rejected: 'Rejected',
}

// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  ADS: {
    LIST: '/api/ads',
    DETAIL: (slug: string) => `/api/ads/${slug}`,
  },
  CLIENT: {
    ADS: '/api/client/ads',
    AD: (id: string) => `/api/client/ads/${id}`,
    PAYMENTS: '/api/client/payments',
    DASHBOARD: '/api/client/dashboard',
  },
  MODERATOR: {
    QUEUE: '/api/moderator/review-queue',
    REVIEW: (id: string) => `/api/moderator/ads/${id}/review`,
  },
  ADMIN: {
    PAYMENT_QUEUE: '/api/admin/payment-queue',
    VERIFY_PAYMENT: (id: string) => `/api/admin/payments/${id}/verify`,
    PUBLISH_AD: (id: string) => `/api/admin/ads/${id}/publish`,
    ANALYTICS: '/api/admin/analytics/summary',
  },
  PACKAGES: '/api/packages',
  CATEGORIES: '/api/categories',
  CITIES: '/api/cities',
  QUESTIONS: '/api/questions/random',
  HEALTH: '/api/health/db',
} as const

// ─── App Config ───────────────────────────────────────────────────────────────
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'AdFlow Pro',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/600x400?text=AdFlow+Pro',
  EXPIRY_WARNING_HOURS: 48,
  MAX_MEDIA_PER_AD: 5,
}

// ─── Nav Items per role ───────────────────────────────────────────────────────
export const CLIENT_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Ads', href: '/dashboard/ads', icon: 'FileText' },
  { label: 'Post New Ad', href: '/dashboard/ads/new', icon: 'PlusCircle' },
  { label: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell' },
]

export const MODERATOR_NAV = [
  { label: 'Review Queue', href: '/moderator', icon: 'ClipboardList' },
]

export const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Payment Queue', href: '/admin/payments', icon: 'CreditCard' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Categories', href: '/admin/categories', icon: 'Tag' },
  { label: 'Packages', href: '/admin/packages', icon: 'Package' },
  { label: 'System Health', href: '/admin/health', icon: 'Activity' },
]
