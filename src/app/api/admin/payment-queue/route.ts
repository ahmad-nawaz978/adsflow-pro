/**
 * @file app/api/admin/payment-queue/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/admin/payment-queue
 *   Returns all payments with status='pending' for admin verification.
 *   Includes full ad info, package price, and client details.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/apiHelpers'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['admin', 'super_admin'])
  if ('status' in auth) return auth

  try {
    const { data, error } = await supabaseServer
      .from('payments')
      .select(`
        id, amount, method, transaction_ref, sender_name,
        screenshot_url, status, created_at,
        ad:ads(
          id, title, slug, status,
          package:packages(name, price),
          owner:users(id, name, email)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error
    return ok(data ?? [])
  } catch (e) {
    console.error('[ADMIN PAYMENT QUEUE]', e)
    return err('Failed to fetch payment queue', 500)
  }
}
