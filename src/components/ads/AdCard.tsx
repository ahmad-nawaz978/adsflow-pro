/**
 * @file components/ads/AdCard.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public-facing ad card shown in the explore grid.
 *   Displays thumbnail, title, price, category, city, package badge,
 *   featured crown, and expiry. Links to /ads/:slug.
 */

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Star } from 'lucide-react'
import { cn, formatCurrency, timeAgo } from '@/lib/utils'
import { APP_CONFIG } from '@/constants'
import type { Ad } from '@/types'

interface AdCardProps {
  ad: Ad
  className?: string
}

export function AdCard({ ad, className }: AdCardProps) {
  const thumb = ad.media?.[0]?.thumbnail_url ?? APP_CONFIG.PLACEHOLDER_IMAGE
  const isFeatured = ad.is_featured || ad.package?.is_featured

  return (
    <Link
      href={`/ads/${ad.slug}`}
      className={cn(
        'group block bg-white rounded-xl border border-gray-200 overflow-hidden',
        'hover:shadow-card-hover hover:border-brand-200 transition-all duration-200',
        isFeatured && 'ring-1 ring-brand-400 border-brand-300',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <Image
          src={thumb}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {isFeatured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-brand-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 fill-white" />
            Featured
          </div>
        )}
        {ad.package && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {ad.package.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mb-2">
          {ad.title}
        </h3>

        {ad.price != null && (
          <p className="text-base font-bold text-brand-700 mb-2">
            {formatCurrency(ad.price)}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {ad.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {ad.city.name}
            </span>
          )}
          {ad.category && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
              {ad.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {timeAgo(ad.created_at)}
          </span>
          {ad.seller?.is_verified && (
            <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
