/**
 * @file app/(client)/dashboard/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Client dashboard overview. Shows stats cards for total ads,
 *   pending review, active, and expired listings. Lists recent ads and
 *   recent payments. Fetches data from /api/client/dashboard.
 */

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle, XCircle, CreditCard, PlusCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { AdStatusBadge } from '@/components/ads/AdStatusBadge'
import { PageLoader } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import api from '@/lib/axios'
import { formatDate, formatCurrency, timeAgo } from '@/lib/utils'

function useDashboard() {
  return useQuery({
    queryKey: ['client-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/client/dashboard')
      return res.data.data
    },
  })
}

export default function ClientDashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <PageLoader text="Loading dashboard..." />
      </DashboardLayout>
    )
  }

  const stats = data?.stats ?? {}

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Ads" value={stats.total ?? 0} icon={FileText} />
          <StatsCard label="Pending Review" value={stats.pending_review ?? 0} icon={Clock} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
          <StatsCard label="Live Ads" value={stats.published ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatsCard label="Expired" value={stats.expired ?? 0} icon={XCircle} iconColor="text-red-500" iconBg="bg-red-50" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent ads */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Ads</h2>
              <Link href="/dashboard/ads" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
            </div>
            {data?.recent_ads?.length ? (
              <ul className="divide-y divide-gray-50">
                {data.recent_ads.map((ad: any) => (
                  <li key={ad.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(ad.created_at)}</p>
                    </div>
                    <AdStatusBadge status={ad.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">You haven&apos;t posted any ads yet.</p>
                <Link href="/dashboard/ads/new">
                  <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>Post Your First Ad</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Recent payments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Payment History</h2>
              <Link href="/dashboard/payments" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
            </div>
            {data?.recent_payments?.length ? (
              <ul className="divide-y divide-gray-50">
                {data.recent_payments.map((p: any) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.ad?.title ?? 'Ad payment'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.method} · {formatDate(p.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                      <span className={`text-xs font-medium ${p.status === 'verified' ? 'text-green-600' : p.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'}`}>
                        {p.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No payment history yet.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick action */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Ready to post a new ad?</h3>
            <p className="text-blue-100 text-sm mt-1">Reach thousands of buyers with a verified listing.</p>
          </div>
          <Link href="/dashboard/ads/new">
            <button className="bg-white text-brand-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Post New Ad
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
