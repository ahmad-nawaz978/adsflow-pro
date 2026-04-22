/**
 * @file app/api/client/ads/[id]/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/client/ads/:id — Get single ad details (owner only).
 *   PATCH /api/client/ads/:id — Edit ad (only allowed in draft/rejected status).
 *   PUT /api/client/ads/:id/submit — Submit ad for moderation review.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { editAdSchema } from '@/schemas/adSchema'
import { requireAuth, ok, err, writeAuditLog, writeStatusHistory, sendNotification } from '@/lib/apiHelpers'
import { normalizeMediaUrl } from '@/lib/media'

// ─── GET — Get own ad details ─────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request, ['client', 'moderator', 'admin', 'super_admin'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const query = supabaseServer
      .from('ads')
      .select(`
        *, package:packages(*), category:categories(*),
        city:cities(*), media:ad_media(*),
        status_history:ad_status_history(* , changer:users(name, role))
      `)
      .eq('id', params.id)

    // Clients can only see their own ads
    if (user.role === 'client') query.eq('user_id', user.id)

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    if (!data) return err('Ad not found', 404)
    return ok(data)
  } catch (e) {
    console.error('[CLIENT AD GET]', e)
    return err('Failed to fetch ad', 500)
  }
}

// ─── PATCH — Edit ad ──────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request, ['client'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    // Verify ownership
    const { data: existing } = await supabaseServer
      .from('ads')
      .select('id, status, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) return err('Ad not found', 404)

    const editableStatuses = ['draft', 'rejected']
    if (!editableStatuses.includes(existing.status)) {
      return err('You can only edit ads in draft or rejected status', 422)
    }

    const body = await request.json()
    const result = editAdSchema.safeParse({ ...body, id: params.id })
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { media, id: _id, ...updateFields } = result.data

    // Update ad
    const { data: updated, error } = await supabaseServer
      .from('ads')
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, slug, status')
      .single()

    if (error) throw error

    // Re-insert media if provided
    if (media) {
      await supabaseServer.from('ad_media').delete().eq('ad_id', params.id)
      const mediaRows = media.map((m) => {
        const normalized = normalizeMediaUrl(m.original_url)
        return {
          ad_id: params.id,
          source_type: normalized.source_type,
          original_url: m.original_url,
          thumbnail_url: normalized.thumbnail_url,
          validation_status: normalized.validation_status,
        }
      })
      await supabaseServer.from('ad_media').insert(mediaRows)
    }

    await writeAuditLog({
      actor_id: user.id,
      action_type: 'update',
      target_type: 'ad',
      target_id: params.id,
      new_value: updateFields as Record<string, unknown>,
    })

    return ok(updated, 'Ad updated successfully')
  } catch (e) {
    console.error('[CLIENT AD PATCH]', e)
    return err('Failed to update ad', 500)
  }
}

// ─── PUT — Submit ad for review ───────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request, ['client'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const { data: ad } = await supabaseServer
      .from('ads')
      .select('id, status, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!ad) return err('Ad not found', 404)
    if (ad.status !== 'draft') return err('Only draft ads can be submitted', 422)

    await supabaseServer
      .from('ads')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    await writeStatusHistory({
      ad_id: params.id,
      previous_status: 'draft',
      new_status: 'submitted',
      changed_by: user.id,
      note: 'Submitted for moderation',
    })

    await sendNotification({
      user_id: user.id,
      title: 'Ad submitted for review',
      message: 'Your ad has been submitted and is now under moderation review.',
      type: 'info',
      link: `/dashboard/ads`,
    })

    return ok({ id: params.id, status: 'submitted' }, 'Ad submitted for review')
  } catch (e) {
    console.error('[CLIENT AD SUBMIT]', e)
    return err('Failed to submit ad', 500)
  }
}
