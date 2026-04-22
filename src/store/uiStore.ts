/**
 * @file store/uiStore.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zustand store for UI state: sidebar open/close, active modal,
 *   and unread notification count. Used across dashboard layout components.
 */

import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  activeModal: string | null
  unreadNotifications: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  setUnreadNotifications: (count: number) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  unreadNotifications: 0,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}))
