/**
 * @file components/ads/MediaPreview.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Renders normalized media for an ad. Supports image thumbnails,
 *   YouTube play overlay, multi-image strip, and placeholder fallback on error.
 *   No local file uploads — all media sourced from external URLs.
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/constants'
import type { AdMedia } from '@/types'

interface MediaPreviewProps {
  media: AdMedia[]
  title: string
  className?: string
}

export function MediaPreview({ media, title, className }: MediaPreviewProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  const active = media[activeIdx]

  if (!active) {
    return (
      <div className={cn('w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400', className)}>
        <p className="text-sm">No media available</p>
      </div>
    )
  }

  const thumbSrc = imgErrors[activeIdx] ? APP_CONFIG.PLACEHOLDER_IMAGE : (active.thumbnail_url ?? APP_CONFIG.PLACEHOLDER_IMAGE)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main display */}
      <div className="relative w-full h-72 rounded-xl overflow-hidden bg-gray-100 group">
        <Image
          src={thumbSrc}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgErrors((prev) => ({ ...prev, [activeIdx]: true }))}
          sizes="(max-width: 768px) 100vw, 600px"
          priority={activeIdx === 0}
        />
        {active.source_type === 'youtube' && (
          <a
            href={active.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
            aria-label="Watch on YouTube"
          >
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </a>
        )}
        {/* Index counter */}
        {media.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {activeIdx + 1} / {media.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={item.id ?? i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIdx ? 'border-brand-500 ring-1 ring-brand-400' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={imgErrors[i] ? APP_CONFIG.PLACEHOLDER_IMAGE : (item.thumbnail_url ?? APP_CONFIG.PLACEHOLDER_IMAGE)}
                alt={`Media ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
              />
              {item.source_type === 'youtube' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" fill="white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
