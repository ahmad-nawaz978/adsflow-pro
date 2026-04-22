/**
 * @file components/ui/Badge.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Badge component for status labels and counts.
 */

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className?: string
}

const variantMap = {
  default: 'bg-gray-100 text-gray-700 border border-gray-200',
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  info:    'bg-blue-100 text-blue-700 border border-blue-200',
  purple:  'bg-purple-100 text-purple-700 border border-purple-200',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantMap[variant], className)}>
      {children}
    </span>
  )
}
