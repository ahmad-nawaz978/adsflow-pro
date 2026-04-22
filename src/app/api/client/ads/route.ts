/**
 * @file app/api/client/ads/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/client/ads — List current client's own ads with status.
 *   POST /api/client/ads — Create a new ad draft with normalized media URLs.
 *   Requires client role. Normalizes media, generates slug, computes rank score.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { createAdSchema } from '@/schemas/adSchema'
import { requireAuth, ok, err, writeAuditLog, writeStatusHistory } from '@/lib/apiHelpers'
import { normalizeMediaUrl } from '@/lib/media'
import { calculateRankScore, generateSlug } from '@/lib/utils'

// ─── GET — List client's own ads ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['client', 'moderator', 'admin', 'super_admin'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const { data, error } = await supabaseServer
      .from('ads')
      .select(`
        id, title, slug, status, price, is_featured, rank_score,
        publish_at, expire_at, created_at, updated_at,
        package:packages(name, duration_days),
        category:categories(name, slug),
        city:cities(name),
        media:ad_media(thumbnail_url, source_type)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return ok(data ?? [])
  } catch (e) {
    console.error('[CLIENT ADS GET]', e)
    return err('Failed to fetch your ads', 500)
  }
}

// ─── POST — Create new ad draft ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['client'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const body = await request.json()
    const result = createAdSchema.safeParse(body)
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { title, description, category_id, city_id, package_id, price, contact_phone, media } =
      result.data

    // Generate unique slug
    const slug = generateSlug(title, crypto.randomUUID())

    // Compute initial rank score (no package info yet, will recalculate on publish)
    const rank_score = 0

    // Insert ad
    const { data: ad, error: adError } = await supabaseServer
      .from('ads')
      .insert({
        user_id: user.id,
        package_id,
        category_id,
        city_id,
        title,
        slug,
        description,
        price: price ?? null,
        contact_phone: contact_phone || null,
        status: 'draft',
        rank_score,
      })
      .select('id, slug, status')
      .single()

    if (adError || !ad) {
      console.error('[CLIENT ADS POST] insert error:', adError)
      return err('Failed to create ad', 500)
    }

    // Insert normalized media
    const mediaRows = media.map((m) => {
      const normalized = normalizeMediaUrl(m.original_url)
      return {
        ad_id: ad.id,
        source_type: normalized.source_type,
        original_url: m.original_url,
        thumbnail_url: normalized.thumbnail_url,
        validation_status: normalized.validation_status,
      }
    })

    await supabaseServer.from('ad_media').insert(mediaRows)

    // Audit log
    await writeAuditLog({
      actor_id: user.id,
      action_type: 'create',
      target_type: 'ad',
      target_id: ad.id,
      new_value: { title, status: 'draft' },
    })

    // Status history
    await writeStatusHistory({
      ad_id: ad.id,
      previous_status: null,
      new_status: 'draft',
      changed_by: user.id,
      note: 'Ad created as draft',
    })

    return ok(ad, 'Ad created successfully', 201)
  } catch (e) {
    console.error('[CLIENT ADS POST]', e)
    return err('Failed to create ad', 500)
  }
}
