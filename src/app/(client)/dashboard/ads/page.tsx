/**
 * @file app/(client)/dashboard/ads/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Client "My Ads" page. Lists all ads owned by the current user
 *   with status badges, action buttons (edit, submit, view), and expiry dates.
 *   Uses useMyAds and useSubmitAd React Query hooks.
 */

'use client'

import Link from 'next/link'
import { PlusCircle, Edit, Eye, Send, Clock } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdStatusBadge } from '@/components/ads/AdStatusBadge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { useMyAds, useSubmitAd } from '@/hooks/useAds'
import { formatDate, isExpired } from '@/lib/utils'
import { APP_CONFIG } from '@/constants'
import type { Ad } from '@/types'
import Image from 'next/image'

export default function MyAdsPage() {
  const { data: ads, isLoading } = useMyAds()
  const submitAd = useSubmitAd()

  if (isLoading) {
    return <DashboardLayout title="My Ads"><PageLoader /></DashboardLayout>
  }

  return (
    <DashboardLayout title="My Ads">
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{ads?.length ?? 0} total ads</p>
          <Link href="/dashboard/ads/new">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>Post New Ad</Button>
          </Link>
        </div>

        {/* Ads list */}
        {!ads?.length ? (
          <Card className="text-center py-16">
            <PlusCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No ads yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first listing to reach buyers.</p>
            <Link href="/dashboard/ads/new"><Button>Post Your First Ad</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {ads.map((ad: Ad) => (
              <AdRow key={ad.id} ad={ad} onSubmit={() => submitAd.mutate(ad.id)} submitting={submitAd.isPending} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function AdRow({ ad, onSubmit, submitting }: { ad: Ad; onSubmit: () => void; submitting: boolean }) {
  const thumb = ad.media?.[0]?.thumbnail_url ?? APP_CONFIG.PLACEHOLDER_IMAGE
  const expired = isExpired(ad.expire_at)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-card transition-shadow">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image src={thumb} alt={ad.title} fill className="object-cover" sizes="80px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 truncate text-sm">{ad.title}</h3>
          <AdStatusBadge status={ad.status} />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
          {ad.package && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{ad.package.name}</span>}
          {ad.expire_at && (
            <span className={`flex items-center gap-1 ${expired ? 'text-red-500' : ''}`}>
              <Clock className="w-3 h-3" />
              {expired ? 'Expired' : `Expires ${formatDate(ad.expire_at)}`}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {ad.status === 'published' && (
          <Link href={`/ads/${ad.slug}`} target="_blank">
            <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>View</Button>
          </Link>
        )}
        {(ad.status === 'draft' || ad.status === 'rejected') && (
          <>
            <Link href={`/dashboard/ads/${ad.id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>Edit</Button>
            </Link>
            {ad.status === 'draft' && (
              <Button size="sm" leftIcon={<Send className="w-4 h-4" />} loading={submitting} onClick={onSubmit}>
                Submit
              </Button>
            )}
          </>
        )}
        {ad.status === 'payment_pending' && (
          <Link href="/dashboard/payments">
            <Button size="sm">Pay Now</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
