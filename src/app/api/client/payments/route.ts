/**
 * @file app/api/client/payments/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Client payments API with TypeScript errors fixed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'
import { submitPaymentSchema } from '@/schemas/paymentSchema'

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseServer
      .from('payments')
      .select('id, amount, method, transaction_ref, sender_name, screenshot_url, status, admin_note, created_at, ad_id')
      .order('created_at', { ascending: false })

    if (error) throw error

    const paymentList = (data ?? []) as Array<{ ad_id: string; [key: string]: unknown }>
    const adIds = Array.from(new Set(paymentList.map((p) => p.ad_id).filter(Boolean)))
    let adsMap: Record<string, unknown> = {}

    if (adIds.length > 0) {
      const { data: ads } = await supabaseServer
        .from('ads')
        .select('id, title, slug, status, user_id')
        .in('id', adIds)
        .eq('user_id', user.id)

      adsMap = Object.fromEntries((ads ?? []).map((a: { id: string }) => [a.id, a]))
    }

    const filtered = paymentList.filter((p) => adsMap[p.ad_id])
    const enriched = filtered.map((p) => ({ ...p, ad: adsMap[p.ad_id] ?? null }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch payments'
    console.error('[CLIENT PAYMENTS GET]', msg)
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const result = submitPaymentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { ad_id, amount, method, transaction_ref, sender_name, screenshot_url } = result.data

    const { data: ad, error: adError } = await supabaseServer
      .from('ads')
      .select('id, status, user_id')
      .eq('id', ad_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (adError) return NextResponse.json({ success: false, message: adError.message }, { status: 500 })
    if (!ad) return NextResponse.json({ success: false, message: 'Ad not found' }, { status: 404 })

    const adRow = ad as { id: string; status: string; user_id: string }
    if (adRow.status !== 'payment_pending') {
      return NextResponse.json({ success: false, message: `Ad status is ${adRow.status}, not payment_pending` }, { status: 422 })
    }

    const { data: dupRef } = await supabaseServer
      .from('payments')
      .select('id')
      .eq('transaction_ref', transaction_ref)
      .maybeSingle()

    if (dupRef) return NextResponse.json({ success: false, message: 'Transaction reference already used' }, { status: 409 })

    const { data: payment, error: payError } = await supabaseServer
      .from('payments')
      .insert({ ad_id, amount, method, transaction_ref, sender_name, screenshot_url: screenshot_url || null, status: 'pending' })
      .select('id, status')
      .single()

    if (payError || !payment) {
      return NextResponse.json({ success: false, message: payError?.message ?? 'Insert failed' }, { status: 500 })
    }

    await supabaseServer.from('ads').update({ status: 'payment_submitted', updated_at: new Date().toISOString() }).eq('id', ad_id)

    await supabaseServer.from('ad_status_history').insert({
      ad_id, previous_status: 'payment_pending', new_status: 'payment_submitted',
      changed_by: user.id, note: `Payment submitted via ${method}`,
    })

    await supabaseServer.from('notifications').insert({
      user_id: user.id, title: 'Payment proof submitted',
      message: 'Your payment proof is being reviewed by our admin team.',
      type: 'success', link: '/dashboard/payments',
    })

    return NextResponse.json({ success: true, data: { payment_id: (payment as { id: string }).id }, message: 'Payment submitted successfully' }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to submit payment'
    console.error('[CLIENT PAYMENT POST CATCH]', msg)
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
