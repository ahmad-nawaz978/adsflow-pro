/**
 * @file components/providers/QueryProvider.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description TanStack React Query client provider. Wraps the entire app to
 *   enable server state caching, background refetching, and query invalidation.
 *   Configured with sensible defaults for a marketplace application.
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // 1 min — data considered fresh
            gcTime: 5 * 60 * 1000,      // 5 min — cache kept in memory
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
