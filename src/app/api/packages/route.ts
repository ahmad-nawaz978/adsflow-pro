/**
 * @file app/api/packages/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/packages — Returns all active packages for public display.
 */

import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
    if (error) throw error
    return ok(data ?? [])
  } catch (e) {
    console.error('[PACKAGES]', e)
    return err('Failed to fetch packages', 500)
  }
}
