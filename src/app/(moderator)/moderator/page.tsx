/**
 * @file app/(moderator)/moderator/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Moderator review queue. Lists all ads in submitted/under_review
 *   status. Allows moderator to approve (move to payment_pending) or reject
 *   with a reason. Auto-refreshes every 30 seconds via React Query.
 */

'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { useReviewQueue, useReviewAd } from '@/hooks/useAds'
import { MediaPreview } from '@/components/ads/MediaPreview'
import { timeAgo, formatDate } from '@/lib/utils'
import type { Ad } from '@/types'

export default function ModeratorQueuePage() {
  const { data: queue, isLoading } = useReviewQueue()
  const [selected, setSelected] = useState<Ad | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const reviewAd = useReviewAd()

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await reviewAd.mutateAsync({ id, action, note: action === 'reject' ? rejectNote : undefined })
    setSelected(null)
    setRejectNote('')
  }

  if (isLoading) return <DashboardLayout title="Review Queue"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Review Queue">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{queue?.length ?? 0} ads awaiting review</p>
          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
            Auto-refreshes every 30s
          </span>
        </div>

        {!queue?.length ? (
          <Card className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">Queue is empty</h3>
            <p className="text-sm text-gray-500 mt-1">All caught up! No ads pending review.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {queue.map((ad: Ad) => (
              <Card key={ad.id} padding="none" className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                        <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                          {ad.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{(ad as any).category?.name}</span>
                        <span>{(ad as any).city?.name}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(ad.created_at)}</span>
                        {(ad as any).seller?.is_verified && <span className="text-teal-600">✓ Verified seller</span>}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{ad.description}</p>
                    </div>
                    {ad.media?.[0] && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={ad.media[0].thumbnail_url ?? ''} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                  </div>

                  {/* Seller info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex gap-4">
                    <span>Owner: <strong className="text-gray-700">{(ad as any).owner?.name ?? 'Unknown'}</strong></span>
                    <span>Email: <strong className="text-gray-700">{(ad as any).owner?.email}</strong></span>
                    {ad.contact_phone && <span>Phone: <strong className="text-gray-700">{ad.contact_phone}</strong></span>}
                  </div>
                </div>

                {/* Media validation warning */}
                {ad.media?.some((m) => m.validation_status === 'invalid') && (
                  <div className="mx-5 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    ⚠️ One or more media URLs failed validation. Review before approving.
                  </div>
                )}

                {/* Reject input (shown when rejecting) */}
                {selected?.id === ad.id && (
                  <div className="mx-5 mb-4">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Rejection reason (required)</label>
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="e.g. Duplicate listing, prohibited content, missing description..."
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-4 flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => setSelected(selected?.id === ad.id ? null : ad)}
                  >
                    {selected?.id === ad.id ? 'Collapse' : 'Review Details'}
                  </Button>
                  <div className="flex-1" />
                  {selected?.id === ad.id ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        loading={reviewAd.isPending}
                        disabled={!rejectNote.trim()}
                        onClick={() => handleAction(ad.id, 'reject')}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        loading={reviewAd.isPending}
                        onClick={() => handleAction(ad.id, 'approve')}
                      >
                        Approve
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="danger" size="sm" leftIcon={<XCircle className="w-4 h-4" />} onClick={() => setSelected(ad)}>Reject</Button>
                      <Button size="sm" leftIcon={<CheckCircle className="w-4 h-4" />} loading={reviewAd.isPending} onClick={() => handleAction(ad.id, 'approve')}>Approve</Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
