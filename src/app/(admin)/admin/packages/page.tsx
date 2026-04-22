/**
 * @file app/(admin)/admin/packages/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin packages management. Shows all packages with their price,
 *   duration, weight, and featured flag. Allows toggling active/inactive state.
 *   Package creation requires DB direct insert for now.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Package as PkgType } from '@/types'

export default function AdminPackagesPage() {
  const qc = useQueryClient()

  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data } = await supabase.from('packages').select('*').order('price')
      return (data ?? []) as PkgType[]
    },
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('packages').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Package updated')
      qc.invalidateQueries({ queryKey: ['admin-packages'] })
      qc.invalidateQueries({ queryKey: ['packages'] })
    },
    onError: () => toast.error('Failed to update package'),
  })

  if (isLoading) return <DashboardLayout title="Packages"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Manage Packages">
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-gray-500">{packages?.length ?? 0} packages</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages?.map((pkg) => (
            <Card key={pkg.id} className="relative">
              {pkg.is_featured && (
                <div className="absolute top-3 right-3 text-brand-600">
                  <Star className="w-4 h-4 fill-brand-600" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pkg.is_active ? 'bg-brand-50' : 'bg-gray-100'}`}>
                  <Package className={`w-5 h-5 ${pkg.is_active ? 'text-brand-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-xs text-gray-400">{pkg.duration_days} days</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {[
                  { label: 'Price', value: formatCurrency(pkg.price) },
                  { label: 'Weight', value: `×${pkg.weight}` },
                  { label: 'Featured', value: pkg.is_featured ? 'Yes' : 'No' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => toggle.mutate({ id: pkg.id, is_active: !pkg.is_active })}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pkg.is_active
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {pkg.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {pkg.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
              </button>
            </Card>
          ))}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <strong>Note:</strong> To add new packages, insert directly in Supabase Dashboard → Table Editor → packages.
          Ensure weight, duration_days, and price are set correctly.
        </div>
      </div>
    </DashboardLayout>
  )
}
