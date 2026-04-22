/**
 * @file hooks/usePackages.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description React Query hooks for packages, categories, and cities.
 *   These lists are used in ad creation forms and public browse filters.
 *   Cached aggressively since they change rarely.
 */

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { API } from '@/constants'
import type { Package, Category, City } from '@/types'

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Package[] }>(API.PACKAGES)
      return res.data.data ?? []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Category[] }>(API.CATEGORIES)
      return res.data.data ?? []
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: City[] }>(API.CITIES)
      return res.data.data ?? []
    },
    staleTime: 10 * 60 * 1000,
  })
}
