/**
 * @file components/ui/Pagination.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Pagination component with prev/next buttons, page numbers,
 *   and current page indicator. Used on the explore ads page and admin lists.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages[0] > 1 && (
        <>
          <PageBtn p={1} current={page} onClick={onPageChange} />
          {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => <PageBtn key={p} p={p} current={page} onClick={onPageChange} />)}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <PageBtn p={totalPages} current={page} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function PageBtn({ p, current, onClick }: { p: number; current: number; onClick: (p: number) => void }) {
  return (
    <button
      onClick={() => onClick(p)}
      className={cn(
        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
        p === current
          ? 'bg-brand-600 text-white border border-brand-700'
          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
      )}
    >
      {p}
    </button>
  )
}
