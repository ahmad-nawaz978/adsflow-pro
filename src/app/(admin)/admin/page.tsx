/**
 * @file app/(admin)/admin/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin dashboard overview. Shows stats cards for listings,
 *   revenue, and moderation rates. Includes payment queue count and quick
 *   links to admin sub-sections. Fetches from /api/admin/analytics/summary.
 */

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, CreditCard, BarChart3, CheckCircle, XCircle, Clock, DollarSign, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import api from '@/lib/axios'
import { formatCurrency } from '@/lib/utils'

function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/summary')
      return res.data.data
    },
    refetchInterval: 60_000,
  })
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminAnalytics()

  if (isLoading) return <DashboardLayout title="Admin Overview"><PageLoader /></DashboardLayout>

  const listings = data?.listings ?? {}
  const revenue = data?.revenue ?? {}
  const moderation = data?.moderation ?? {}

  return (
    <DashboardLayout title="Admin Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Listings" value={listings.total ?? 0} icon={LayoutDashboard} />
          <StatsCard label="Live Ads" value={listings.active ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatsCard label="Pending Review" value={listings.pending_review ?? 0} icon={Clock} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
          <StatsCard label="Total Revenue" value={formatCurrency(revenue.total_verified ?? 0)} icon={DollarSign} iconColor="text-brand-600" iconBg="bg-brand-50" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Moderation stats */}
          <Card>
            <CardHeader><CardTitle>Moderation</CardTitle></CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approval rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${moderation.approval_rate ?? 0}%` }} />
                  </div>
                  <span className="text-sm font-bold text-green-600">{moderation.approval_rate ?? 0}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rejection rate</span>
                <span className="text-sm font-bold text-red-500">{moderation.rejection_rate ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rejected ads</span>
                <span className="text-sm font-medium text-gray-900">{listings.rejected ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expired ads</span>
                <span className="text-sm font-medium text-gray-900">{listings.expired ?? 0}</span>
              </div>
            </div>
          </Card>

          {/* Revenue by package */}
          <Card>
            <CardHeader><CardTitle>Revenue by Package</CardTitle></CardHeader>
            {revenue.by_package?.length ? (
              <div className="space-y-3">
                {revenue.by_package.map((p: any) => (
                  <div key={p.package_name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.package_name}</p>
                      <p className="text-xs text-gray-400">{p.count} payments</p>
                    </div>
                    <span className="text-sm font-bold text-brand-700">{formatCurrency(p.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No verified payments yet</p>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <div className="space-y-2">
              {[
                { href: '/admin/payments', label: 'Payment Queue', icon: CreditCard, color: 'text-brand-600' },
                { href: '/admin/analytics', label: 'View Analytics', icon: BarChart3, color: 'text-purple-600' },
                { href: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-teal-600' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Top categories */}
        {data?.taxonomy?.by_category?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Ads by Category</CardTitle></CardHeader>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.taxonomy.by_category.slice(0, 6).map((c: any) => (
                <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  <span className="text-sm font-bold text-gray-900">{c.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
