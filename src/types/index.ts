/**
 * @file types/index.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description All TypeScript interfaces and types for AdFlow Pro.
 *   Covers every entity: User, Ad, Payment, Package, Category, City,
 *   Notification, AuditLog, and all API response shapes.
 */

// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role = 'client' | 'moderator' | 'admin' | 'super_admin'

// ─── Ad Status ────────────────────────────────────────────────────────────────
export type AdStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'payment_pending'
  | 'payment_submitted'
  | 'payment_verified'
  | 'scheduled'
  | 'published'
  | 'expired'
  | 'archived'
  | 'rejected'

// ─── Payment Status ───────────────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'verified' | 'rejected'

// ─── Media Source Type ────────────────────────────────────────────────────────
export type MediaSourceType = 'image' | 'youtube' | 'cloudinary'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'suspended' | 'banned'
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

// ─── Seller Profile ───────────────────────────────────────────────────────────
export interface SellerProfile {
  id: string
  user_id: string
  display_name: string
  business_name?: string
  phone?: string
  city?: string
  is_verified: boolean
  created_at: string
}

// ─── Package ──────────────────────────────────────────────────────────────────
export interface Package {
  id: string
  name: string
  duration_days: number
  weight: number
  is_featured: boolean
  price: number
  is_active: boolean
  created_at: string
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

// ─── City ─────────────────────────────────────────────────────────────────────
export interface City {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

// ─── Ad Media ─────────────────────────────────────────────────────────────────
export interface AdMedia {
  id: string
  ad_id: string
  source_type: MediaSourceType
  original_url: string
  thumbnail_url?: string
  validation_status: 'pending' | 'valid' | 'invalid'
  created_at: string
}

// ─── Ad ───────────────────────────────────────────────────────────────────────
export interface Ad {
  id: string
  user_id: string
  package_id: string
  category_id: string
  city_id: string
  title: string
  slug: string
  description: string
  price?: number
  contact_phone?: string
  status: AdStatus
  publish_at?: string
  expire_at?: string
  is_featured: boolean
  admin_boost: number
  rank_score: number
  created_at: string
  updated_at: string
  // Joined relations
  package?: Package
  category?: Category
  city?: City
  media?: AdMedia[]
  seller?: SellerProfile
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: string
  ad_id: string
  amount: number
  method: string
  transaction_ref: string
  sender_name: string
  screenshot_url?: string
  status: PaymentStatus
  admin_note?: string
  created_at: string
  updated_at: string
  // Joined
  ad?: Pick<Ad, 'id' | 'title' | 'slug' | 'package'>
  user?: Pick<User, 'id' | 'name' | 'email'>
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  link?: string
  created_at: string
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string
  actor_id: string
  action_type: string
  target_type: string
  target_id: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  created_at: string
  actor?: Pick<User, 'id' | 'name' | 'email'>
}

// ─── Ad Status History ────────────────────────────────────────────────────────
export interface AdStatusHistory {
  id: string
  ad_id: string
  previous_status?: AdStatus
  new_status: AdStatus
  changed_by?: string
  note?: string
  changed_at: string
  changer?: Pick<User, 'id' | 'name' | 'role'>
}

// ─── Learning Question ────────────────────────────────────────────────────────
export interface LearningQuestion {
  id: string
  question: string
  answer: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  is_active: boolean
}

// ─── System Health Log ────────────────────────────────────────────────────────
export interface SystemHealthLog {
  id: string
  source: string
  response_ms: number
  status: 'ok' | 'slow' | 'error'
  checked_at: string
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

// ─── Dashboard / Analytics ────────────────────────────────────────────────────
export interface DashboardStats {
  total_ads: number
  active_ads: number
  pending_review: number
  expired_ads: number
  total_revenue: number
  pending_payments: number
  approval_rate: number
  rejection_rate: number
}

export interface AdminAnalytics {
  listings: {
    total: number
    active: number
    pending_review: number
    expired: number
    rejected: number
  }
  revenue: {
    total_verified: number
    by_package: { package_name: string; total: number; count: number }[]
    monthly: { month: string; total: number }[]
  }
  moderation: {
    approval_rate: number
    rejection_rate: number
    flagged: number
  }
  taxonomy: {
    by_category: { category: string; count: number }[]
    by_city: { city: string; count: number }[]
  }
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
