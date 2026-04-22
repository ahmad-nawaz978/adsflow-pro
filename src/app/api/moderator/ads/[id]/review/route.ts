/**
 * @file app/api/moderator/ads/[id]/review/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description PATCH /api/moderator/ads/:id/review
 *   Moderator approves (moves to payment_pending) or rejects an ad.
 *   Writes status history, audit log, and sends notification to the client.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { reviewAdSchema } from '@/schemas/adSchema'
import { requireAuth, ok, err, writeAuditLog, writeStatusHistory, sendNotification } from '@/lib/apiHelpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request, ['moderator', 'admin', 'super_admin'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const body = await request.json()
    const result = reviewAdSchema.safeParse(body)
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { action, note } = result.data

    // Get current ad
    const { data: ad } = await supabaseServer
      .from('ads')
      .select('id, status, user_id, title')
      .eq('id', params.id)
      .in('status', ['submitted', 'under_review'])
      .maybeSingle()

    if (!ad) return err('Ad not found or not reviewable', 404)

    const newStatus = action === 'approve' ? 'payment_pending' : 'rejected'

    await supabaseServer
      .from('ads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    await writeStatusHistory({
      ad_id: params.id,
      previous_status: ad.status,
      new_status: newStatus,
      changed_by: user.id,
      note: note ?? (action === 'approve' ? 'Content approved by moderator' : 'Content rejected by moderator'),
    })

    await writeAuditLog({
      actor_id: user.id,
      action_type: `moderator_${action}`,
      target_type: 'ad',
      target_id: params.id,
      old_value: { status: ad.status },
      new_value: { status: newStatus, note },
    })

    // Notify the ad owner
    await sendNotification({
      user_id: ad.user_id!,
      title: action === 'approve' ? 'Ad approved — please submit payment' : 'Ad content rejected',
      message: action === 'approve'
        ? `Your ad "${ad.title}" passed content review. Please submit payment to proceed.`
        : `Your ad "${ad.title}" was rejected. Reason: ${note ?? 'Content does not meet our guidelines.'}`,
      type: action === 'approve' ? 'success' : 'error',
      link: `/dashboard/ads`,
    })

    return ok({ id: params.id, status: newStatus }, `Ad ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
  } catch (e) {
    console.error('[MOD REVIEW]', e)
    return err('Failed to process review', 500)
  }
}
