/**
 * @file app/api/ads/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/ads - Public browse endpoint with TypeScript errors fixed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

interface AdRow {
  id: string
  title: string
  slug: string
  description: string
  price: number | null
  status: string
  is_featured: boolean
  rank_score: number
  publish_at: string | null
  expire_at: string | null
  created_at: string
  user_id: string
  category_id: string
  city_id: string
  package_id: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search   = searchParams.get('search') ?? ''
    const category = searchParams.get('category') ?? ''
    const city     = searchParams.get('city') ?? ''
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(parseInt(searchParams.get('page_size') ?? '12'), 50)
    const offset   = (page - 1) * pageSize
    const now      = new Date().toISOString()

    let query = supabaseServer
      .from('ads')
      .select('id, title, slug, description, price, status, is_featured, rank_score, publish_at, expire_at, created_at, user_id, category_id, city_id, package_id', { count: 'exact' })
      .eq('status', 'published')
      .gt('expire_at', now)

    if (search) query = query.ilike('title', `%${search}%`)

    const { data: ads, error, count } = await query
      .order('rank_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    if (!ads || ads.length === 0) {
      return NextResponse.json({ success: true, data: { data: [], total: 0, page, page_size: pageSize, total_pages: 0 } })
    }

    const typedAds = ads as AdRow[]

    const adIds      = typedAds.map((a) => a.id)
    const categoryIds = Array.from(new Set(typedAds.map((a) => a.category_id).filter(Boolean)))
    const cityIds     = Array.from(new Set(typedAds.map((a) => a.city_id).filter(Boolean)))
    const packageIds  = Array.from(new Set(typedAds.map((a) => a.package_id).filter(Boolean)))
    const userIds     = Array.from(new Set(typedAds.map((a) => a.user_id).filter(Boolean)))

    const [mediaRes, categoriesRes, citiesRes, packagesRes, sellersRes] = await Promise.all([
      supabaseServer.from('ad_media').select('ad_id, source_type, thumbnail_url, original_url').in('ad_id', adIds),
      categoryIds.length > 0 ? supabaseServer.from('categories').select('id, name, slug').in('id', categoryIds) : Promise.resolve({ data: [] }),
      cityIds.length > 0     ? supabaseServer.from('cities').select('id, name, slug').in('id', cityIds)         : Promise.resolve({ data: [] }),
      packageIds.length > 0  ? supabaseServer.from('packages').select('id, name, weight, is_featured, duration_days').in('id', packageIds) : Promise.resolve({ data: [] }),
      userIds.length > 0     ? supabaseServer.from('seller_profiles').select('user_id, display_name, is_verified').in('user_id', userIds) : Promise.resolve({ data: [] }),
    ])

    const mediaMap: Record<string, unknown[]> = {}
    ;(mediaRes.data ?? []).forEach((m) => {
      if (m.ad_id) {
        if (!mediaMap[m.ad_id]) mediaMap[m.ad_id] = []
        mediaMap[m.ad_id].push(m)
      }
    })

    const categoriesMap = Object.fromEntries((categoriesRes.data ?? []).filter(c => c.id).map(c => [c.id!, c]))
    const citiesMap     = Object.fromEntries((citiesRes.data ?? []).filter(c => c.id).map(c => [c.id!, c]))
    const packagesMap   = Object.fromEntries((packagesRes.data ?? []).filter(p => p.id).map(p => [p.id!, p]))
    const sellersMap    = Object.fromEntries((sellersRes.data ?? []).filter(s => s.user_id).map(s => [s.user_id!, s]))

    let enriched = typedAds.map((ad) => ({
      ...ad,
      media:    mediaMap[ad.id] ?? [],
      category: categoriesMap[ad.category_id] ?? null,
      city:     citiesMap[ad.city_id] ?? null,
      package:  packagesMap[ad.package_id] ?? null,
      seller:   sellersMap[ad.user_id] ?? null,
    }))

    if (category) enriched = enriched.filter((a) => (a.category as { slug?: string } | null)?.slug === category)
    if (city)     enriched = enriched.filter((a) => (a.city as { slug?: string } | null)?.slug === city)

    return NextResponse.json({
      success: true,
      data: {
        data: enriched,
        total: count ?? 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count ?? 0) / pageSize),
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch ads'
    console.error('[ADS LIST]', e)
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
