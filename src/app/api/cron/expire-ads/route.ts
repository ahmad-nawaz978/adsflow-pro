/**
 * @file app/api/cron/expire-ads/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description POST /api/cron/expire-ads
 *   Daily cron job. Finds all published ads where expire_at has passed,
 *   marks them expired, sends notifications to owners, and logs health.
 *   Secured by CRON_SECRET authorization header.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return err('Unauthorized', 401)
  }

  const startTime = Date.now()

  try {
    const now = new Date().toISOString()

    // Find expired published ads
    const { data: expiredAds, error } = await supabaseServer
      .from('ads')
      .select('id, user_id, title')
      .eq('status', 'published')
      .lt('expire_at', now)

    if (error) throw error

    if (!expiredAds?.length) {
      await supabaseServer.from('system_health_logs').insert({
        source: 'cron:expire-ads',
        response_ms: Date.now() - startTime,
        status: 'ok',
      })
      return ok({ expired: 0 })
    }

    const ids = expiredAds.map((a) => a.id)

    await supabaseServer
      .from('ads')
      .update({ status: 'expired', updated_at: now })
      .in('id', ids)

    await supabaseServer.from('ad_status_history').insert(
      ids.map((id) => ({
        ad_id: id,
        previous_status: 'published',
        new_status: 'expired',
        note: 'Auto-expired by daily cron job',
      }))
    )

    // Notify owners
    await supabaseServer.from('notifications').insert(
      expiredAds.map((ad) => ({
        user_id: ad.user_id,
        title: 'Your ad has expired',
        message: `Your listing "${ad.title}" has expired. Post a new ad or contact support to renew.`,
        type: 'warning',
        link: '/dashboard/ads',
      }))
    )

    // Also send expiry-soon warnings (48 hours ahead)
    const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    const { data: soonAds } = await supabaseServer
      .from('ads')
      .select('id, user_id, title, expire_at')
      .eq('status', 'published')
      .lt('expire_at', in48h)
      .gt('expire_at', now)

    if (soonAds?.length) {
      await supabaseServer.from('notifications').insert(
        soonAds.map((ad) => ({
          user_id: ad.user_id,
          title: 'Your ad expires soon',
          message: `Your listing "${ad.title}" will expire within 48 hours.`,
          type: 'warning',
          link: '/dashboard/ads',
        }))
      )
    }

    await supabaseServer.from('system_health_logs').insert({
      source: 'cron:expire-ads',
      response_ms: Date.now() - startTime,
      status: 'ok',
    })

    return ok({ expired: ids.length, expiry_warnings_sent: soonAds?.length ?? 0 })
  } catch (e) {
    console.error('[CRON EXPIRE]', e)
    await supabaseServer.from('system_health_logs').insert({
      source: 'cron:expire-ads',
      response_ms: Date.now() - startTime,
      status: 'error',
    })
    return err('Cron job failed', 500)
  }
}
