/**
 * @file components/ui/Card.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Card container component with optional header, padding variants.
 */

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-card', paddingMap[padding], className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4 pb-4 border-b border-gray-100', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-gray-900', className)}>{children}</h3>
}
