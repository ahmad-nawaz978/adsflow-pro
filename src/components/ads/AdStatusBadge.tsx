/**
 * @file components/ads/AdStatusBadge.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Color-coded badge showing ad workflow status using the
 *   STATUS_COLORS constant map for consistent Tailwind color classes.
 */

import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS } from '@/constants'
import type { AdStatus } from '@/types'

interface AdStatusBadgeProps {
  status: AdStatus
  className?: string
}

export function AdStatusBadge({ status, className }: AdStatusBadgeProps) {
  return (
    <span className={cn('badge', STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600', className)}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
