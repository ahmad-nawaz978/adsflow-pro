/**
 * @file lib/media.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Media URL normalization utilities. Handles YouTube ID extraction
 *   and thumbnail generation, image URL validation, Cloudinary detection, and
 *   graceful placeholder fallback. No local file uploads — URLs only.
 */

import { APP_CONFIG, MEDIA_SOURCE } from '@/constants'
import type { MediaSourceType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NormalizedMedia {
  source_type: MediaSourceType
  original_url: string
  thumbnail_url: string
  validation_status: 'valid' | 'invalid'
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

/**
 * Extract video ID from any YouTube URL format
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

/**
 * Generate YouTube thumbnail URL (high quality)
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

// ─── Image Validation ─────────────────────────────────────────────────────────

const VALID_IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i
const ALLOWED_DOMAINS = [
  'raw.githubusercontent.com',
  'github.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'img.youtube.com',
]

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    const isAllowedDomain = ALLOWED_DOMAINS.some((d) => parsed.hostname.includes(d))
    const hasImageExt = VALID_IMAGE_EXTENSIONS.test(parsed.pathname)
    return isAllowedDomain || hasImageExt
  } catch {
    return false
  }
}

// ─── Core Normalizer ──────────────────────────────────────────────────────────

/**
 * Takes any user-submitted media URL and normalizes it into a standard
 * object with source_type, thumbnail_url, and validation_status.
 */
export function normalizeMediaUrl(url: string): NormalizedMedia {
  if (!url?.trim()) {
    return {
      source_type: MEDIA_SOURCE.IMAGE,
      original_url: url,
      thumbnail_url: APP_CONFIG.PLACEHOLDER_IMAGE,
      validation_status: 'invalid',
    }
  }

  // ── YouTube ──
  const ytId = extractYouTubeId(url)
  if (ytId) {
    return {
      source_type: MEDIA_SOURCE.YOUTUBE,
      original_url: url,
      thumbnail_url: getYouTubeThumbnail(ytId),
      validation_status: 'valid',
    }
  }

  // ── Cloudinary ──
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
    return {
      source_type: MEDIA_SOURCE.CLOUDINARY,
      original_url: url,
      thumbnail_url: url,
      validation_status: 'valid',
    }
  }

  // ── Standard image URL ──
  if (isValidImageUrl(url)) {
    return {
      source_type: MEDIA_SOURCE.IMAGE,
      original_url: url,
      thumbnail_url: url,
      validation_status: 'valid',
    }
  }

  // ── Fallback: invalid ──
  return {
    source_type: MEDIA_SOURCE.IMAGE,
    original_url: url,
    thumbnail_url: APP_CONFIG.PLACEHOLDER_IMAGE,
    validation_status: 'invalid',
  }
}

/**
 * Normalize an array of media URLs and return only valid ones
 */
export function normalizeMediaArray(
  urls: { original_url: string; source_type: MediaSourceType }[]
): NormalizedMedia[] {
  return urls.map((item) => normalizeMediaUrl(item.original_url))
}

/**
 * Get first valid thumbnail from a list of normalized media
 */
export function getPrimaryThumbnail(media: NormalizedMedia[]): string {
  return media.find((m) => m.validation_status === 'valid')?.thumbnail_url ?? APP_CONFIG.PLACEHOLDER_IMAGE
}
