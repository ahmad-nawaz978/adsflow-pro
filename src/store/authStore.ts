/**
 * @file store/authStore.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Zustand store for authentication state. Persists token to
 *   localStorage and syncs cookie for API routes.
 */

import { create } from 'zustand'
import type { AuthUser } from '@/types'

const TOKEN_KEY = 'adflow_token'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  hydrateFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      const maxAge = 60 * 60 * 24 * 7
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
    }
    set({ user, token, isAuthenticated: true, isLoading: false })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  hydrateFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false })
      return
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Invalid token')
      const payload = JSON.parse(atob(parts[1]))

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY)
        document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
        set({ isLoading: false })
        return
      }

      // Re-sync cookie
      const maxAge = 60 * 60 * 24 * 7
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`

      set({
        token,
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        },
      })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
      set({ isLoading: false })
    }
  },
}))
