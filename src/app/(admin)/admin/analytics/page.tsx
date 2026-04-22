/**
 * @file app/(admin)/admin/analytics/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Full analytics dashboard with Recharts visualizations.
 *   Shows monthly revenue bar chart, ads by category horizontal bar,
 *   ads by city bar, moderation pie chart, and summary stat cards.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PageLoader } from '@/components/ui/Spinner'
import { BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import api from '@/lib/axios'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/summary')
      return res.data.data
    },
  })
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) return <DashboardLayout title="Analytics"><PageLoader /></DashboardLayout>

  const revenue = data?.revenue ?? {}
  const moderation = data?.moderation ?? {}
  const listings = data?.listings ?? {}
  const taxonomy = data?.taxonomy ?? {}

  const moderationPieData = [
    { name: 'Approved', value: moderation.total_reviewed - (listings.rejected ?? 0) },
    { name: 'Rejected', value: listings.rejected ?? 0 },
  ]

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6 animate-fade-in">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue" value={formatCurrency(revenue.total_verified ?? 0)} icon={TrendingUp} />
          <StatsCard label="Active Listings" value={listings.active ?? 0} icon={BarChart3} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatsCard label="Approval Rate" value={`${moderation.approval_rate ?? 0}%`} icon={CheckCircle} iconColor="text-teal-600" iconBg="bg-teal-50" />
          <StatsCard label="Rejection Rate" value={`${moderation.rejection_rate ?? 0}%`} icon={XCircle} iconColor="text-red-500" iconBg="bg-red-50" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly revenue chart */}
          <Card>
            <CardHeader><CardTitle>Monthly Revenue (PKR)</CardTitle></CardHeader>
            {revenue.monthly?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue.monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">No revenue data yet</div>
            )}
          </Card>

          {/* Moderation pie */}
          <Card>
            <CardHeader><CardTitle>Moderation Breakdown</CardTitle></CardHeader>
            {moderation.total_reviewed > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={moderationPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {moderationPieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">No moderation data yet</div>
            )}
          </Card>

          {/* Ads by category */}
          <Card>
            <CardHeader><CardTitle>Ads by Category</CardTitle></CardHeader>
            {taxonomy.by_category?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart layout="vertical" data={taxonomy.by_category.slice(0, 6)} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">No category data</div>
            )}
          </Card>

          {/* Ads by city */}
          <Card>
            <CardHeader><CardTitle>Ads by City</CardTitle></CardHeader>
            {taxonomy.by_city?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={taxonomy.by_city.slice(0, 6)} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">No city data</div>
            )}
          </Card>
        </div>

        {/* Revenue by package table */}
        {revenue.by_package?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Revenue by Package</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-500">Package</th>
                    <th className="text-right py-2 font-medium text-gray-500">Payments</th>
                    <th className="text-right py-2 font-medium text-gray-500">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {revenue.by_package.map((row: any) => (
                    <tr key={row.package_name}>
                      <td className="py-3 font-medium text-gray-900">{row.package_name}</td>
                      <td className="py-3 text-right text-gray-600">{row.count}</td>
                      <td className="py-3 text-right font-bold text-brand-700">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
