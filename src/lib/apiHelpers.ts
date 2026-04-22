/**
 * @file lib/apiHelpers.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Shared helpers for API route handlers: extract authenticated user
 *   from request headers (set by middleware), verify required role, build
 *   standard JSON responses, and write audit log entries.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import type { AuthUser, Role } from '@/types'

// ─── Get current user from middleware-injected headers ────────────────────────
export function getCurrentUser(request: NextRequest): AuthUser | null {
  const id = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as Role | null
  const name = request.headers.get('x-user-name') ?? ''
  const email = request.headers.get('x-user-email') ?? ''
  if (!id || !role) return null
  return { id, role, name, email }
}

// ─── Require auth — returns user or sends 401 ─────────────────────────────────
export function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): { user: AuthUser } | NextResponse {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
  }
  return { user }
}

// ─── Standard success/error responses ────────────────────────────────────────
export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

export function err(message: string, status = 400, errors?: Record<string, string[]>) {
  return NextResponse.json({ success: false, message, errors }, { status })
}

// ─── Write audit log ──────────────────────────────────────────────────────────
export async function writeAuditLog(params: {
  actor_id: string
  action_type: string
  target_type: string
  target_id: string
  old_value?: Record<string, unknown> | null
  new_value?: Record<string, unknown> | null
}) {
  try {
    await supabaseServer.from('audit_logs').insert(params)
  } catch {
    // Audit log failure should not break the main operation
  }
}

// ─── Write ad status history ──────────────────────────────────────────────────
export async function writeStatusHistory(params: {
  ad_id: string
  previous_status: string | null
  new_status: string
  changed_by?: string
  note?: string
}) {
  try {
    await supabaseServer.from('ad_status_history').insert(params)
  } catch {
    // Non-blocking
  }
}

// ─── Send notification to user ────────────────────────────────────────────────
export async function sendNotification(params: {
  user_id: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  link?: string
}) {
  try {
    await supabaseServer.from('notifications').insert({
      ...params,
      type: params.type ?? 'info',
    })
  } catch {
    // Non-blocking
  }
}
