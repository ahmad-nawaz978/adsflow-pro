/**
 * @file components/dashboard/StatsCard.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Statistics card for dashboard overviews. Shows icon, label,
 *   value, and optional trend/change indicator.
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatsCard({ label, value, icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50', trend, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-1 font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
