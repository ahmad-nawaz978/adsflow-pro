/**
 * @file app/api/client/dashboard/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/client/dashboard
 *   Returns summary stats for the client dashboard: total ads by status,
 *   recent ads, unread notifications count, and latest payment statuses.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/apiHelpers'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['client'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    // All ads for this user
    const { data: ads, error: adsError } = await supabaseServer
      .from('ads')
      .select('id, title, slug, status, created_at, expire_at, package:packages(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (adsError) throw adsError

    const adList = ads ?? []

    // Count by status
    const statusCounts = adList.reduce((acc: Record<string, number>, ad) => {
      acc[ad.status] = (acc[ad.status] ?? 0) + 1
      return acc
    }, {})

    // Unread notifications
    const { count: unreadCount } = await supabaseServer
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // Recent payments
    const { data: payments } = await supabaseServer
      .from('payments')
      .select('id, amount, method, status, created_at, ad:ads(title)')
      .eq('ads.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    return ok({
      stats: {
        total: adList.length,
        draft: statusCounts['draft'] ?? 0,
        pending_review: (statusCounts['submitted'] ?? 0) + (statusCounts['under_review'] ?? 0),
        payment_pending: (statusCounts['payment_pending'] ?? 0) + (statusCounts['payment_submitted'] ?? 0),
        published: statusCounts['published'] ?? 0,
        expired: statusCounts['expired'] ?? 0,
        rejected: statusCounts['rejected'] ?? 0,
        unread_notifications: unreadCount ?? 0,
      },
      recent_ads: adList.slice(0, 5),
      recent_payments: payments ?? [],
    })
  } catch (e) {
    console.error('[CLIENT DASHBOARD]', e)
    return err('Failed to fetch dashboard data', 500)
  }
}
