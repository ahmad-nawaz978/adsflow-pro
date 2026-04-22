/**
 * @file store/adStore.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zustand store for multi-step ad creation draft state.
 *   Persists partial form data across steps so users don't lose progress
 *   when navigating between Step 1 (details), Step 2 (media), Step 3 (package).
 */

import { create } from 'zustand'
import type { CreateAdInput } from '@/schemas/adSchema'

interface AdDraftState {
  draft: Partial<CreateAdInput>
  currentStep: number
  updateDraft: (data: Partial<CreateAdInput>) => void
  setStep: (step: number) => void
  resetDraft: () => void
}

export const useAdStore = create<AdDraftState>((set) => ({
  draft: {},
  currentStep: 1,
  updateDraft: (data) => set((s) => ({ draft: { ...s.draft, ...data } })),
  setStep: (step) => set({ currentStep: step }),
  resetDraft: () => set({ draft: {}, currentStep: 1 }),
}))
