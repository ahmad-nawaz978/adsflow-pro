/**
 * @file hooks/useAds.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description React Query hooks for all ad-related data fetching and mutations.
 *   Covers public ad browsing, client dashboard ads, moderator queue, admin
 *   publish, and ad creation/editing mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { API } from '@/constants'
import { getApiError } from '@/lib/utils'
import type { Ad, PaginatedResponse } from '@/types'
import type { CreateAdInput } from '@/schemas/adSchema'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const AD_KEYS = {
  all: ['ads'] as const,
  list: (params: object) => ['ads', 'list', params] as const,
  detail: (slug: string) => ['ads', 'detail', slug] as const,
  myAds: () => ['ads', 'my'] as const,
  reviewQueue: () => ['ads', 'review-queue'] as const,
  paymentQueue: () => ['payments', 'queue'] as const,
}

// ─── Public ad browsing ───────────────────────────────────────────────────────
interface BrowseParams {
  search?: string
  category?: string
  city?: string
  page?: number
  page_size?: number
}

export function usePublicAds(params: BrowseParams = {}) {
  return useQuery({
    queryKey: AD_KEYS.list(params),
    queryFn: async () => {
      const query = new URLSearchParams()
      if (params.search)    query.set('search', params.search)
      if (params.category)  query.set('category', params.category)
      if (params.city)      query.set('city', params.city)
      if (params.page)      query.set('page', String(params.page))
      if (params.page_size) query.set('page_size', String(params.page_size))

      const res = await api.get<{ success: boolean; data: PaginatedResponse<Ad> }>(`${API.ADS.LIST}?${query}`)
      return res.data.data!
    },
  })
}

// ─── Ad detail (public) ───────────────────────────────────────────────────────
export function useAdDetail(slug: string) {
  return useQuery({
    queryKey: AD_KEYS.detail(slug),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Ad }>(API.ADS.DETAIL(slug))
      return res.data.data!
    },
    enabled: !!slug,
  })
}

// ─── Client's own ads ─────────────────────────────────────────────────────────
export function useMyAds() {
  return useQuery({
    queryKey: AD_KEYS.myAds(),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Ad[] }>(API.CLIENT.ADS)
      return res.data.data ?? []
    },
  })
}

// ─── Moderator review queue ───────────────────────────────────────────────────
export function useReviewQueue() {
  return useQuery({
    queryKey: AD_KEYS.reviewQueue(),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Ad[] }>(API.MODERATOR.QUEUE)
      return res.data.data ?? []
    },
    refetchInterval: 30_000, // Auto-refresh every 30s
  })
}

// ─── Admin payment queue ──────────────────────────────────────────────────────
export function usePaymentQueue() {
  return useQuery({
    queryKey: AD_KEYS.paymentQueue(),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: any[] }>(API.ADMIN.PAYMENT_QUEUE)
      return res.data.data ?? []
    },
  })
}

// ─── Create ad mutation ───────────────────────────────────────────────────────
export function useCreateAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateAdInput) => {
      const res = await api.post<{ success: boolean; data: Ad }>(API.CLIENT.ADS, data)
      return res.data.data!
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AD_KEYS.myAds() })
      toast.success('Ad created successfully!')
    },
    onError: (e) => toast.error(getApiError(e)),
  })
}

// ─── Submit ad for review ─────────────────────────────────────────────────────
export function useSubmitAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put<{ success: boolean }>(API.CLIENT.AD(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AD_KEYS.myAds() })
      toast.success('Ad submitted for review!')
    },
    onError: (e) => toast.error(getApiError(e)),
  })
}

// ─── Moderator review action ──────────────────────────────────────────────────
export function useReviewAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) => {
      const res = await api.patch<{ success: boolean }>(API.MODERATOR.REVIEW(id), { action, note })
      return res.data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: AD_KEYS.reviewQueue() })
      toast.success(`Ad ${vars.action === 'approve' ? 'approved' : 'rejected'} successfully`)
    },
    onError: (e) => toast.error(getApiError(e)),
  })
}

// ─── Admin verify payment ─────────────────────────────────────────────────────
export function useVerifyPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'verify' | 'reject'; note?: string }) => {
      const res = await api.patch<{ success: boolean }>(API.ADMIN.VERIFY_PAYMENT(id), { action, admin_note: note })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AD_KEYS.paymentQueue() })
      toast.success('Payment processed successfully')
    },
    onError: (e) => toast.error(getApiError(e)),
  })
}

// ─── Admin publish ad ─────────────────────────────────────────────────────────
export function usePublishAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; action: 'publish' | 'schedule' | 'reject'; publish_at?: string; is_featured?: boolean; admin_boost?: number; note?: string }) => {
      const { id, ...body } = data
      const res = await api.patch<{ success: boolean }>(API.ADMIN.PUBLISH_AD(id), body)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AD_KEYS.paymentQueue() })
      qc.invalidateQueries({ queryKey: AD_KEYS.all })
      toast.success('Ad status updated successfully')
    },
    onError: (e) => toast.error(getApiError(e)),
  })
}
