/**
 * @file app/(admin)/layout.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin route group layout with TypeScript types fixed.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    try {
      const token = localStorage.getItem('adflow_token')
      if (!token) { router.replace('/login'); return }
      const payload = JSON.parse(atob(token.split('.')[1])) as { role: string; exp: number }
      if (!['admin', 'super_admin'].includes(payload.role)) {
        router.replace('/unauthorized')
        return
      }
      setOk(true)
    } catch {
      router.replace('/login')
    }
  }, [router])

  if (!ok) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Checking access...</p>
    </div>
  )

  return <>{children}</>
}
