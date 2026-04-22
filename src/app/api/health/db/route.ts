/**
 * @file app/api/health/db/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/health/db — Database heartbeat check.
 *   Performs a lightweight query, measures response time, logs to
 *   system_health_logs, and returns ok/slow/error status.
 */

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const start = Date.now()
  try {
    const { error } = await supabaseServer
      .from('system_health_logs')
      .select('id')
      .limit(1)

    const ms = Date.now() - start
    const status = error ? 'error' : ms > 3000 ? 'slow' : 'ok'

    await supabaseServer.from('system_health_logs').insert({
      source: 'health/db',
      response_ms: ms,
      status,
    })

    return NextResponse.json({ success: true, status, response_ms: ms, checked_at: new Date().toISOString() })
  } catch (e) {
    const ms = Date.now() - start
    return NextResponse.json({ success: false, status: 'error', response_ms: ms }, { status: 503 })
  }
}
