/**
 * @file app/api/admin/payments/[id]/verify/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description PATCH /api/admin/payments/:id/verify
 *   Admin verifies or rejects a payment. On verify: advances ad to
 *   payment_verified status. Writes audit log and notifies the client.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { verifyPaymentSchema } from '@/schemas/paymentSchema'
import { requireAuth, ok, err, writeAuditLog, writeStatusHistory, sendNotification } from '@/lib/apiHelpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request, ['admin', 'super_admin'])
  if ('status' in auth) return auth
  const { user } = auth

  try {
    const body = await request.json()
    const result = verifyPaymentSchema.safeParse(body)
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { action, admin_note } = result.data

    // Get payment + joined ad info
    const { data: payment } = await supabaseServer
      .from('payments')
      .select('id, status, ad_id, ads(id, status, user_id, title)')
      .eq('id', params.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (!payment) return err('Payment not found or already processed', 404)

    const ad = (payment as any).ads
    if (!ad) return err('Associated ad not found', 404)

    const newPaymentStatus = action === 'verify' ? 'verified' : 'rejected'
    const newAdStatus = action === 'verify' ? 'payment_verified' : 'payment_pending'

    // Update payment
    await supabaseServer
      .from('payments')
      .update({ status: newPaymentStatus, admin_note: admin_note ?? null, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    // Update ad status
    await supabaseServer
      .from('ads')
      .update({ status: newAdStatus, updated_at: new Date().toISOString() })
      .eq('id', ad.id)

    await writeStatusHistory({
      ad_id: ad.id,
      previous_status: ad.status,
      new_status: newAdStatus,
      changed_by: user.id,
      note: admin_note ?? `Payment ${action === 'verify' ? 'verified' : 'rejected'} by admin`,
    })

    await writeAuditLog({
      actor_id: user.id,
      action_type: `payment_${action}`,
      target_type: 'payment',
      target_id: params.id,
      old_value: { payment_status: 'pending', ad_status: ad.status },
      new_value: { payment_status: newPaymentStatus, ad_status: newAdStatus, admin_note },
    })

    await sendNotification({
      user_id: ad.user_id,
      title: action === 'verify' ? 'Payment verified!' : 'Payment rejected',
      message: action === 'verify'
        ? `Your payment for "${ad.title}" has been verified. Your ad will be published shortly.`
        : `Your payment for "${ad.title}" was rejected. Reason: ${admin_note ?? 'Payment could not be confirmed.'}`,
      type: action === 'verify' ? 'success' : 'error',
      link: `/dashboard/payments`,
    })

    return ok({ payment_id: params.id, ad_id: ad.id, status: newPaymentStatus }, `Payment ${action}d successfully`)
  } catch (e) {
    console.error('[ADMIN VERIFY PAYMENT]', e)
    return err('Failed to process payment verification', 500)
  }
}
