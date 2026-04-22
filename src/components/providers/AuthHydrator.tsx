/**
 * @file components/providers/AuthHydrator.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Runs once on app mount to hydrate the Zustand auth store
 *   from localStorage. Must complete before AuthGuard makes any decisions.
 */

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage)

  useEffect(() => {
    // Hydrate immediately on mount
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return <>{children}</>
}
