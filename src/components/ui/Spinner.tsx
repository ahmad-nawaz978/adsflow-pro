/**
 * @file components/ui/Spinner.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Loading spinner with size variants. Used in buttons, page
 *   loaders, and async state indicators throughout the app.
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ size = 'md', className, text }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizeMap[size])} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" text={text} />
    </div>
  )
}
