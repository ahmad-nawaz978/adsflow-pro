/**
 * @file app/api/categories/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/categories — Returns all active categories.
 */

import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return ok(data ?? [])
  } catch (e) {
    console.error('[CATEGORIES]', e)
    return err('Failed to fetch categories', 500)
  }
}
