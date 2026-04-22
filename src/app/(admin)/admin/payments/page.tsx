/**
 * @file app/(admin)/admin/payments/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin payment verification queue. Lists pending payment proofs
 *   with transaction ref, amount, method, and screenshot link. Admin can
 *   verify or reject each with an optional note.
 */

'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { usePaymentQueue, useVerifyPayment } from '@/hooks/useAds'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const { data: queue, isLoading } = usePaymentQueue()
  const verifyPayment = useVerifyPayment()
  const [notes, setNotes] = useState<Record<string, string>>({})

  const handle = async (id: string, action: 'verify' | 'reject') => {
    await verifyPayment.mutateAsync({ id, action, note: notes[id] })
    setNotes((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

  if (isLoading) return <DashboardLayout title="Payment Queue"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Payment Verification Queue">
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-gray-500">{queue?.length ?? 0} payments awaiting verification</p>

        {!queue?.length ? (
          <Card className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">All payments processed</h3>
            <p className="text-sm text-gray-400 mt-1">No pending payments in the queue.</p>
          </Card>
        ) : (
          queue.map((payment: any) => (
            <Card key={payment.id} className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{payment.ad?.title ?? 'Unknown Ad'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {payment.ad?.owner?.name} ({payment.ad?.owner?.email})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-700">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-gray-400">{payment.ad?.package?.name} package</p>
                </div>
              </div>

              {/* Payment details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Method', value: payment.method },
                  { label: 'Transaction Ref', value: payment.transaction_ref },
                  { label: 'Sender Name', value: payment.sender_name },
                  { label: 'Submitted', value: formatDateTime(payment.created_at) },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Screenshot link */}
              {payment.screenshot_url && (
                <a
                  href={payment.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" /> View Payment Screenshot
                </a>
              )}

              {/* Admin note */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Admin note (optional)</label>
                <textarea
                  value={notes[payment.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [payment.id]: e.target.value }))}
                  placeholder="Add a note for this payment decision..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:outline-none resize-none"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  loading={verifyPayment.isPending}
                  onClick={() => handle(payment.id, 'reject')}
                >
                  Reject Payment
                </Button>
                <Button
                  size="sm"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  loading={verifyPayment.isPending}
                  onClick={() => handle(payment.id, 'verify')}
                >
                  Verify &amp; Approve
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
