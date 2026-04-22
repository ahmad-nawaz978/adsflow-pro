/**
 * @file app/(public)/ads/[slug]/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public ad detail page. Shows full ad info: title, description,
 *   price, category, city, package badge, expiry, seller info, and media preview.
 *   Uses Next.js generateMetadata for SEO. Server-side fetched with ISR (60s).
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, Calendar, Package, Phone, CheckCircle, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { MediaPreview } from '@/components/ads/MediaPreview'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Ad } from '@/types'

async function getAd(slug: string): Promise<Ad | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/ads/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const ad = await getAd(params.slug)
  if (!ad) return { title: 'Ad Not Found' }
  return {
    title: ad.title,
    description: ad.description.slice(0, 160),
  }
}

export default async function AdDetailPage({ params }: { params: { slug: string } }) {
  const ad = await getAd(params.slug)
  if (!ad) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Media + Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <MediaPreview media={ad.media ?? []} title={ad.title} />
            </div>

            {/* Title + badges */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {ad.is_featured && (
                  <span className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-200">
                    <Star className="w-3 h-3 fill-brand-600" /> Featured
                  </span>
                )}
                {ad.package && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Package className="w-3 h-3 inline mr-1" />{ad.package.name} Package
                  </span>
                )}
                {ad.category && (
                  <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {ad.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-3">{ad.title}</h1>

              {ad.price != null && (
                <p className="text-2xl font-extrabold text-brand-700 mb-4">
                  {formatCurrency(ad.price)}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                {ad.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" /> {ad.city.name}
                  </span>
                )}
                {ad.expire_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" /> Expires {formatDate(ad.expire_at)}
                  </span>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="whitespace-pre-line leading-relaxed">{ad.description}</p>
              </div>
            </div>
          </div>

          {/* Right: Seller card + contact */}
          <div className="space-y-4">
            {/* Seller */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Seller Information</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
                  {(ad.seller?.display_name ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {ad.seller?.display_name ?? 'Private Seller'}
                  </p>
                  {ad.seller?.business_name && (
                    <p className="text-xs text-gray-500">{ad.seller.business_name}</p>
                  )}
                </div>
              </div>
              {ad.seller?.is_verified && (
                <div className="flex items-center gap-2 text-teal-600 text-xs font-medium bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg mb-3">
                  <CheckCircle className="w-4 h-4" /> Verified Seller
                </div>
              )}
              {ad.seller?.city && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {ad.seller.city}
                </p>
              )}
            </div>

            {/* Contact */}
            {ad.contact_phone && (
              <div className="bg-brand-600 rounded-xl p-5 text-white">
                <h2 className="text-sm font-semibold mb-3">Contact Seller</h2>
                <a
                  href={`tel:${ad.contact_phone}`}
                  className="flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" /> {ad.contact_phone}
                </a>
              </div>
            )}

            {/* Ad info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
              <h2 className="font-semibold text-gray-900">Ad Details</h2>
              {[
                { label: 'Posted', value: formatDate(ad.created_at) },
                { label: 'Package', value: ad.package?.name ?? '—' },
                { label: 'Duration', value: ad.package ? `${ad.package.duration_days} days` : '—' },
                { label: 'Expires', value: ad.expire_at ? formatDate(ad.expire_at) : '—' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
