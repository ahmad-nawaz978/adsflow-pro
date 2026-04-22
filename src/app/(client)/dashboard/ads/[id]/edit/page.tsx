/**
 * @file app/(client)/dashboard/ads/[id]/edit/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Edit page for draft or rejected ads. Pre-fills the form with
 *   existing ad data. Sends PATCH /api/client/ads/:id on submit.
 *   Only allowed when ad status is draft or rejected.
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { editAdSchema, type EditAdInput } from '@/schemas/adSchema'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import api from '@/lib/axios'
import { useCategories, useCities, usePackages } from '@/hooks/usePackages'
import { getApiError } from '@/lib/utils'
import { API } from '@/constants'

export default function EditAdPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const qc = useQueryClient()

  const { data: categories = [] } = useCategories()
  const { data: cities = [] } = useCities()
  const { data: packages = [] } = usePackages()

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad-edit', params.id],
    queryFn: async () => {
      const res = await api.get(API.CLIENT.AD(params.id))
      return res.data.data
    },
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EditAdInput>({
    resolver: zodResolver(editAdSchema),
  })

  // Pre-fill form when ad loads
  useEffect(() => {
    if (ad) {
      reset({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        category_id: ad.category_id,
        city_id: ad.city_id,
        package_id: ad.package_id,
        price: ad.price ?? undefined,
        contact_phone: ad.contact_phone ?? '',
        media: ad.media?.map((m: any) => ({
          original_url: m.original_url,
          source_type: m.source_type,
        })) ?? [{ original_url: '', source_type: 'image' }],
      })
    }
  }, [ad, reset])

  const updateAd = useMutation({
    mutationFn: async (data: EditAdInput) => {
      const { id, ...body } = data
      const res = await api.patch(API.CLIENT.AD(params.id), body)
      return res.data
    },
    onSuccess: () => {
      toast.success('Ad updated successfully!')
      qc.invalidateQueries({ queryKey: ['ads', 'my'] })
      router.push('/dashboard/ads')
    },
    onError: (e) => toast.error(getApiError(e)),
  })

  if (isLoading) return <DashboardLayout title="Edit Ad"><PageLoader /></DashboardLayout>

  if (ad && !['draft', 'rejected'].includes(ad.status)) {
    return (
      <DashboardLayout title="Edit Ad">
        <Card className="text-center py-10">
          <p className="text-gray-600">This ad cannot be edited in its current status: <strong>{ad.status}</strong></p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/ads')} variant="secondary">Back to My Ads</Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Edit Ad">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-lg">Edit Your Ad</h2>
            {ad?.status === 'rejected' && (
              <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                Previously Rejected
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit((d) => updateAd.mutate(d))} className="space-y-5">
            <Input label="Title" placeholder="Ad title" error={errors.title?.message} required {...register('title')} />
            <Textarea label="Description" placeholder="Detailed description..." error={errors.description?.message} required className="min-h-[120px]" {...register('description')} />

            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={categories.map((c: any) => ({ value: c.id, label: c.name }))} placeholder="Select category" error={errors.category_id?.message} required {...register('category_id')} />
              <Select label="City" options={cities.map((c: any) => ({ value: c.id, label: c.name }))} placeholder="Select city" error={errors.city_id?.message} required {...register('city_id')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (PKR)" type="number" placeholder="0" {...register('price', { valueAsNumber: true })} />
              <Input label="Contact Phone" placeholder="+92 300 0000000" {...register('contact_phone')} />
            </div>

            <div className="flex justify-between gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push('/dashboard/ads')}>Cancel</Button>
              <Button type="submit" leftIcon={<Save className="w-4 h-4" />} loading={updateAd.isPending}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
