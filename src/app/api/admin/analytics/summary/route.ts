/**
 * @file app/api/admin/analytics/summary/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/admin/analytics/summary
 *   Returns full analytics dashboard data: listing counts by status,
 *   revenue by package, monthly revenue, moderation rates,
 *   ads by category and city. Admin/super_admin only.
 */

import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/apiHelpers'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['admin', 'super_admin'])
  if ('status' in auth) return auth

  try {
    // ── All ads summary ──
    const { data: allAds } = await supabaseServer
      .from('ads')
      .select('id, status, created_at, category_id, city_id')

    const ads = allAds ?? []
    const statusCount = ads.reduce((acc: Record<string, number>, ad) => {
      acc[ad.status] = (acc[ad.status] ?? 0) + 1
      return acc
    }, {})

    // ── Revenue from verified payments ──
    const { data: payments } = await supabaseServer
      .from('payments')
      .select('id, amount, created_at, status, ad:ads(package:packages(name))')
      .eq('status', 'verified')

    const verifiedPayments = payments ?? []
    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0)

    // Revenue by package
    const byPackage: Record<string, { total: number; count: number }> = {}
    verifiedPayments.forEach((p) => {
      const pkgName = (p as any).ad?.package?.name ?? 'Unknown'
      if (!byPackage[pkgName]) byPackage[pkgName] = { total: 0, count: 0 }
      byPackage[pkgName].total += p.amount ?? 0
      byPackage[pkgName].count++
    })

    // Monthly revenue (last 6 months)
    const monthlyMap: Record<string, number> = {}
    verifiedPayments.forEach((p) => {
      const month = new Date(p.created_at!).toISOString().slice(0, 7) // YYYY-MM
      monthlyMap[month] = (monthlyMap[month] ?? 0) + (p.amount ?? 0)
    })

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({ month, total }))

    // ── Moderation stats ──
    const totalReviewed = (statusCount['payment_pending'] ?? 0) +
      (statusCount['rejected'] ?? 0) +
      (statusCount['payment_submitted'] ?? 0) +
      (statusCount['payment_verified'] ?? 0) +
      (statusCount['scheduled'] ?? 0) +
      (statusCount['published'] ?? 0) +
      (statusCount['expired'] ?? 0)

    const approvalRate = totalReviewed > 0
      ? Math.round(((totalReviewed - (statusCount['rejected'] ?? 0)) / totalReviewed) * 100)
      : 0
    const rejectionRate = totalReviewed > 0
      ? Math.round(((statusCount['rejected'] ?? 0) / totalReviewed) * 100)
      : 0

    // ── By category ──
    const { data: categories } = await supabaseServer
      .from('categories')
      .select('id, name')

    const byCategoryMap: Record<string, { name: string; count: number }> = {}
    ;(categories ?? []).forEach((c) => { byCategoryMap[c.id] = { name: c.name, count: 0 } })
    ads.forEach((ad) => {
      if (ad.category_id && byCategoryMap[ad.category_id]) {
        byCategoryMap[ad.category_id].count++
      }
    })

    const byCategory = Object.values(byCategoryMap)
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    // ── By city ──
    const { data: cities } = await supabaseServer
      .from('cities')
      .select('id, name')

    const byCityMap: Record<string, { name: string; count: number }> = {}
    ;(cities ?? []).forEach((c) => { byCityMap[c.id] = { name: c.name, count: 0 } })
    ads.forEach((ad) => {
      if (ad.city_id && byCityMap[ad.city_id]) {
        byCityMap[ad.city_id].count++
      }
    })

    const byCity = Object.values(byCityMap)
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    return ok({
      listings: {
        total: ads.length,
        active: statusCount['published'] ?? 0,
        pending_review: (statusCount['submitted'] ?? 0) + (statusCount['under_review'] ?? 0),
        expired: statusCount['expired'] ?? 0,
        rejected: statusCount['rejected'] ?? 0,
        draft: statusCount['draft'] ?? 0,
      },
      revenue: {
        total_verified: totalRevenue,
        by_package: Object.entries(byPackage).map(([package_name, v]) => ({ package_name, ...v })),
        monthly,
      },
      moderation: {
        approval_rate: approvalRate,
        rejection_rate: rejectionRate,
        total_reviewed: totalReviewed,
      },
      taxonomy: { by_category: byCategory, by_city: byCity },
    })
  } catch (e) {
    console.error('[ADMIN ANALYTICS]', e)
    return err('Failed to fetch analytics', 500)
  }
}
