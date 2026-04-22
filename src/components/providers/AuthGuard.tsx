/**
 * @file components/providers/AuthGuard.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Rock-solid auth guard. Reads token directly from localStorage
 *   and decodes it synchronously — no async race conditions possible.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

function getTokenPayload(): { id: string; role: Role; name: string; email: string; exp: number } | null {
  try {
    const token = localStorage.getItem('adflow_token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('adflow_token')
      return null
    }
    return payload
  } catch {
    return null
  }
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    const payload = getTokenPayload()

    if (!payload) {
      router.replace('/login')
      setStatus('unauthorized')
      return
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      router.replace('/unauthorized')
      setStatus('unauthorized')
      return
    }

    setStatus('authorized')
  }, [])

  if (status === 'loading' || status === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">
            {status === 'loading' ? 'Checking access...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
