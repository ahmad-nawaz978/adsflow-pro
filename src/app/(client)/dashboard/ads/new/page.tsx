/**
 * @file app/(client)/dashboard/ads/new/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Multi-step ad creation form. Step 1: basic details + media URLs.
 *   Step 2: package selection. Uses Zustand adStore for draft persistence,
 *   React Hook Form + Zod for validation, useCreateAd mutation for submission.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { PlusCircle, Trash2, Link as LinkIcon, ChevronRight, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createAdSchema, type CreateAdInput } from '@/schemas/adSchema'
import { useAdStore } from '@/store/adStore'
import { useCreateAd } from '@/hooks/useAds'
import { usePackages, useCategories, useCities } from '@/hooks/usePackages'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { normalizeMediaUrl } from '@/lib/media'
import { PAYMENT_METHODS, APP_CONFIG } from '@/constants'
import { getApiError, formatCurrency } from '@/lib/utils'
import Image from 'next/image'

const STEPS = ['Ad Details', 'Media', 'Package']

export default function NewAdPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const { draft, updateDraft } = useAdStore()
  const createAd = useCreateAd()

  const { data: packages = [] } = usePackages()
  const { data: categories = [] } = useCategories()
  const { data: cities = [] } = useCities()

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<CreateAdInput>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      ...draft,
      media: draft.media ?? [{ original_url: '', source_type: 'image' }],
    },
  })

  const mediaFields = watch('media') ?? []

  const addMedia = () => {
    if (mediaFields.length >= APP_CONFIG.MAX_MEDIA_PER_AD) return
    setValue('media', [...mediaFields, { original_url: '', source_type: 'image' }])
  }

  const removeMedia = (i: number) => {
    setValue('media', mediaFields.filter((_, idx) => idx !== i))
  }

  const onSubmit = async (data: CreateAdInput) => {
    try {
      updateDraft(data)
      await createAd.mutateAsync(data)
      router.push('/dashboard/ads')
    } catch (e) {
      toast.error(getApiError(e))
    }
  }

  const nextStep = () => {
    updateDraft(getValues())
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <DashboardLayout title="Post New Ad">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i <= step ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-brand-700' : 'text-gray-400'}`}>{label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── Step 0: Details ── */}
          {step === 0 && (
            <Card className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Ad Details</h2>
              <Input label="Title" placeholder="e.g. Used Toyota Corolla 2019 for sale" error={errors.title?.message} required {...register('title')} />
              <Textarea label="Description" placeholder="Describe your item in detail. Include condition, features, and any important information. (Min 50 characters)" error={errors.description?.message} required className="min-h-[140px]" {...register('description')} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                  placeholder="Select category"
                  error={errors.category_id?.message}
                  required
                  {...register('category_id')}
                />
                <Select
                  label="City"
                  options={cities.map((c: any) => ({ value: c.id, label: c.name }))}
                  placeholder="Select city"
                  error={errors.city_id?.message}
                  required
                  {...register('city_id')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (PKR)" type="number" placeholder="0" helperText="Leave blank if price on request" {...register('price', { valueAsNumber: true })} />
                <Input label="Contact Phone" placeholder="+92 300 0000000" {...register('contact_phone')} />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>Next: Media</Button>
              </div>
            </Card>
          )}

          {/* ── Step 1: Media ── */}
          {step === 1 && (
            <Card className="space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Media URLs</h2>
                <p className="text-sm text-gray-500 mt-1">Add external image URLs, YouTube links, or Cloudinary URLs. No file upload needed.</p>
              </div>

              <div className="space-y-3">
                {mediaFields.map((field, i) => {
                  const preview = field.original_url ? normalizeMediaUrl(field.original_url) : null
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      {/* Preview thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {preview?.validation_status === 'valid' ? (
                          <Image src={preview.thumbnail_url} alt="" fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><LinkIcon className="w-5 h-5 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Input
                          placeholder="https://img.youtube.com/... or https://raw.githubusercontent.com/..."
                          error={(errors.media as any)?.[i]?.original_url?.message}
                          {...register(`media.${i}.original_url`)}
                        />
                        <Select
                          options={[{ value: 'image', label: 'Image URL' }, { value: 'youtube', label: 'YouTube Video' }, { value: 'cloudinary', label: 'Cloudinary' }]}
                          {...register(`media.${i}.source_type`)}
                        />
                      </div>
                      {mediaFields.length > 1 && (
                        <button type="button" onClick={() => removeMedia(i)} className="p-2 text-gray-400 hover:text-red-500 mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {mediaFields.length < APP_CONFIG.MAX_MEDIA_PER_AD && (
                <button type="button" onClick={addMedia} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                  <PlusCircle className="w-4 h-4" /> Add another media URL
                </button>
              )}
              {(errors.media as any)?.message && <p className="text-xs text-red-500">{(errors.media as any).message}</p>}

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={prevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
                <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>Next: Package</Button>
              </div>
            </Card>
          )}

          {/* ── Step 2: Package ── */}
          {step === 2 && (
            <Card className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Choose a Package</h2>
              <div className="space-y-3">
                {packages.map((pkg: any) => {
                  const selected = watch('package_id') === pkg.id
                  return (
                    <label
                      key={pkg.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}
                    >
                      <input type="radio" value={pkg.id} {...register('package_id')} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{pkg.name}</p>
                        <p className="text-xs text-gray-500">{pkg.duration_days} days · Priority ×{pkg.weight}{pkg.is_featured ? ' · Featured on homepage' : ''}</p>
                      </div>
                      <p className="font-bold text-brand-700">{formatCurrency(pkg.price)}</p>
                    </label>
                  )
                })}
              </div>
              {errors.package_id && <p className="text-xs text-red-500">{errors.package_id.message}</p>}

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={prevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
                <Button type="submit" loading={createAd.isPending}>Submit Ad for Review</Button>
              </div>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
