/**
 * @file app/api/ads/[slug]/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/ads/:slug
 *   Returns full details of a single published ad by its slug.
 *   Includes joined package, category, city, all media, and seller profile.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data, error } = await supabaseServer
      .from('ads')
      .select(`
        id, title, slug, description, price, contact_phone, status,
        is_featured, rank_score, publish_at, expire_at, created_at,
        package:packages(id, name, weight, is_featured, duration_days, price),
        category:categories(id, name, slug),
        city:cities(id, name, slug),
        media:ad_media(id, source_type, original_url, thumbnail_url, validation_status),
        seller:seller_profiles(display_name, business_name, is_verified, city)
      `)
      .eq('slug', params.slug)
      .eq('status', 'published')
      .gt('expire_at', new Date().toISOString())
      .maybeSingle()

    if (error) throw error
    if (!data) return err('Ad not found', 404)

    return ok(data)
  } catch (error) {
    console.error('[AD DETAIL]', error)
    return err('Failed to fetch ad', 500)
  }
}
