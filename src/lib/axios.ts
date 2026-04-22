/**
 * @file lib/axios.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Configured Axios instance with base URL, request interceptor to
 *   attach JWT from localStorage, and response interceptor for 401 handling.
 *   Import this instead of raw axios everywhere in the codebase.
 */

import axios from 'axios'
import { APP_CONFIG } from '@/constants'

const TOKEN_KEY = 'adflow_token'

// Use relative base URL so client requests target the current origin/port
// (prevents network errors when Next chooses a different port during dev).
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request interceptor — attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor — handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      // Only redirect if not already on auth pages
      const isAuthPage = ['/login', '/register'].some((p) =>
        window.location.pathname.startsWith(p)
      )
      if (!isAuthPage) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    }
    return Promise.reject(error)
  }
)

export default api
