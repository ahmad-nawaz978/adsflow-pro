/**
 * @file app/api/cities/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/cities — Returns all active cities for dropdown/filter.
 */

import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return ok(data ?? [])
  } catch (e) {
    console.error('[CITIES]', e)
    return err('Failed to fetch cities', 500)
  }
}
