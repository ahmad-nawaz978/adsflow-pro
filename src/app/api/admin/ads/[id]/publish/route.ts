/**
 * @file app/api/admin/ads/[id]/publish/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description PATCH /api/admin/ads/:id/publish
 */

import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "").trim()
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const user = verifyToken(token)
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { action, is_featured, admin_boost, note } = body

    console.log("[PUBLISH] ad id:", params.id)

    const { data: ad, error: adError } = await supabaseServer
      .from("ads")
      .select("id, status, user_id, title, package_id")
      .eq("id", params.id)
      .maybeSingle()

    console.log("[PUBLISH] ad:", JSON.stringify(ad), "err:", JSON.stringify(adError))

    if (adError) return NextResponse.json({ success: false, message: adError.message }, { status: 500 })
    if (!ad) return NextResponse.json({ success: false, message: "Ad not found" }, { status: 404 })

    const allowedStatuses = ["payment_verified", "payment_submitted", "scheduled", "published"]
    if (!allowedStatuses.includes(ad.status)) {
      return NextResponse.json({ success: false, message: "Ad status is " + ad.status }, { status: 422 })
    }

    const publishDate = new Date()
    const newStatus = action === "schedule" ? "scheduled" : "published"

    let durationDays = 7
    if (ad.package_id) {
      const { data: pkg } = await supabaseServer.from("packages").select("duration_days").eq("id", ad.package_id).maybeSingle()
      if (pkg) durationDays = pkg.duration_days
    }

    const expireAt = new Date(publishDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
    const rankScore = (is_featured ? 50 : 0) + 10 + (admin_boost ?? 0) + 20

    await supabaseServer.from("ads").update({
      status: newStatus,
      publish_at: publishDate.toISOString(),
      expire_at: expireAt.toISOString(),
      is_featured: is_featured ?? false,
      admin_boost: admin_boost ?? 0,
      rank_score: rankScore,
      updated_at: new Date().toISOString(),
    }).eq("id", params.id)

    await supabaseServer.from("notifications").insert({
      user_id: ad.user_id,
      title: "Your ad is now live!",
      message: "Your ad has been published and is visible to the public.",
      type: "success",
      link: "/dashboard/ads",
    })

    return NextResponse.json({ success: true, data: { id: params.id, status: newStatus }, message: "Ad published successfully" })
  } catch (e: any) {
    console.error("[PUBLISH CATCH]", e?.message ?? e)
    return NextResponse.json({ success: false, message: e?.message ?? "Server error" }, { status: 500 })
  }
}