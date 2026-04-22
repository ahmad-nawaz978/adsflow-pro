/**
 * @file app/api/cron/publish-scheduled/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description POST /api/cron/publish-scheduled
 *   Vercel Cron job (runs every hour). Finds all ads with status='scheduled'
 *   and publish_at <= now, updates them to 'published', logs status history,
 *   and writes a system health log. Secured by CRON_SECRET header.
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

    const { data: dueAds, error } = await supabaseServer
      .from('ads')
      .select('id, user_id, title')
      .eq('status', 'scheduled')
      .lte('publish_at', now)

    if (error) throw error

    if (!dueAds?.length) {
      await logHealth('cron:publish-scheduled', Date.now() - startTime, 'ok')
      return ok({ published: 0, message: 'No ads to publish' })
    }

    const ids = dueAds.map((a) => a.id)

    await supabaseServer
      .from('ads')
      .update({ status: 'published', updated_at: now })
      .in('id', ids)

    // Bulk insert status history
    await supabaseServer.from('ad_status_history').insert(
      ids.map((id) => ({
        ad_id: id,
        previous_status: 'scheduled',
        new_status: 'published',
        note: 'Auto-published by cron job',
      }))
    )

    // Notify owners
    await supabaseServer.from('notifications').insert(
      dueAds.map((ad) => ({
        user_id: ad.user_id,
        title: '🎉 Your ad is now live!',
        message: `Your ad "${ad.title}" has been published and is now visible to the public.`,
        type: 'success',
        link: '/dashboard/ads',
      }))
    )

    await logHealth('cron:publish-scheduled', Date.now() - startTime, 'ok')

    return ok({ published: ids.length, ids })
  } catch (e) {
    console.error('[CRON PUBLISH]', e)
    await logHealth('cron:publish-scheduled', Date.now() - startTime, 'error')
    return err('Cron job failed', 500)
  }
}

async function logHealth(source: string, ms: number, status: 'ok' | 'slow' | 'error') {
  try {
    await supabaseServer.from('system_health_logs').insert({
      source,
      response_ms: ms,
      status: ms > 5000 ? 'slow' : status,
    })
  } catch { /* non-blocking */ }
}
