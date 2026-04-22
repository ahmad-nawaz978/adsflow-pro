/**
 * @file app/api/moderator/review-queue/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/moderator/review-queue with TypeScript errors fixed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'

interface AdRow {
  id: string
  title: string
  slug: string
  description: string
  status: string
  created_at: string
  contact_phone: string | null
  user_id: string
  category_id: string
  city_id: string
  package_id: string
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '').trim()

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || !['moderator', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { data: ads, error } = await supabaseServer
      .from('ads')
      .select('id, title, slug, description, status, created_at, contact_phone, user_id, category_id, city_id, package_id')
      .in('status', ['submitted', 'under_review'])
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[MOD QUEUE ERROR]', error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const typedAds = ads as AdRow[]
    const adIds     = typedAds.map((a) => a.id)
    const userIds   = Array.from(new Set(typedAds.map((a) => a.user_id).filter(Boolean)))
    const catIds    = Array.from(new Set(typedAds.map((a) => a.category_id).filter(Boolean)))
    const cityIds   = Array.from(new Set(typedAds.map((a) => a.city_id).filter(Boolean)))

    const [mediaRes, usersRes, catsRes, citiesRes] = await Promise.all([
      supabaseServer.from('ad_media').select('ad_id, source_type, original_url, thumbnail_url, validation_status').in('ad_id', adIds),
      supabaseServer.from('users').select('id, name, email, created_at').in('id', userIds),
      supabaseServer.from('categories').select('id, name, slug').in('id', catIds),
      supabaseServer.from('cities').select('id, name').in('id', cityIds),
    ])

    const mediaMap: Record<string, unknown[]> = {}
    ;(mediaRes.data ?? []).forEach((m) => {
      if (m.ad_id) {
        if (!mediaMap[m.ad_id]) mediaMap[m.ad_id] = []
        mediaMap[m.ad_id].push(m)
      }
    })

    const usersMap = Object.fromEntries((usersRes.data ?? []).filter(u => u.id).map(u => [u.id!, u]))
    const catsMap  = Object.fromEntries((catsRes.data ?? []).filter(c => c.id).map(c => [c.id!, c]))
    const citiesMap = Object.fromEntries((citiesRes.data ?? []).filter(c => c.id).map(c => [c.id!, c]))

    const enriched = typedAds.map((ad) => ({
      ...ad,
      media:    mediaMap[ad.id] ?? [],
      owner:    usersMap[ad.user_id] ?? null,
      category: catsMap[ad.category_id] ?? null,
      city:     citiesMap[ad.city_id] ?? null,
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    console.error('[MOD QUEUE CATCH]', msg)
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
