/**
 * @file hooks/useAuth.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Custom React hook for authentication operations.
 *   Sets auth state (cookie + localStorage) before navigating.
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { API, ROLES } from '@/constants'
import { getApiError } from '@/lib/utils'
import type { LoginInput, RegisterInput } from '@/schemas/authSchema'
import type { LoginResponse } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = useCallback(
    async (data: LoginInput, redirectTo?: string) => {
      const response = await api.post<{ success: boolean; data: LoginResponse }>(
        API.AUTH.LOGIN,
        data
      )

      if (response.data.success && response.data.data) {
        const { user: authUser, token } = response.data.data

        // Set auth FIRST (writes cookie + localStorage)
        setAuth(authUser, token)

        toast.success(`Welcome back, ${authUser.name}!`)

        // Wait for cookie to be written before navigating
        await new Promise((resolve) => setTimeout(resolve, 200))

        const dest =
          redirectTo ||
          (authUser.role === ROLES.ADMIN || authUser.role === ROLES.SUPER_ADMIN
            ? '/admin'
            : authUser.role === ROLES.MODERATOR
            ? '/moderator'
            : '/dashboard')

        router.push(dest)
      }
    },
    [setAuth, router]
  )

  const register = useCallback(
    async (data: RegisterInput) => {
      const response = await api.post<{ success: boolean; data: LoginResponse }>(
        API.AUTH.REGISTER,
        data
      )

      if (response.data.success && response.data.data) {
        const { user: authUser, token } = response.data.data

        // Set auth FIRST (writes cookie + localStorage)
        setAuth(authUser, token)

        toast.success('Account created! Welcome to AdFlow Pro.')

        // Wait for cookie to be written before navigating
        await new Promise((resolve) => setTimeout(resolve, 200))

        router.push('/dashboard')
      }
    },
    [setAuth, router]
  )

  const logout = useCallback(async () => {
    try {
      await api.post(API.AUTH.LOGOUT)
    } catch {
      // ignore
    }
    clearAuth()
    toast.success('Logged out successfully')
    router.push('/')
  }, [clearAuth, router])

  return { user, isAuthenticated, login, register, logout }
}
