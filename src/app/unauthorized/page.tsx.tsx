/**
 * @file app/unauthorized/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Shown when a user tries to access a route their role does not permit.
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/constants'

export default function UnauthorizedPage() {
  const { user } = useAuthStore()

  const dashboardHref =
    user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN
      ? '/admin'
      : user?.role === ROLES.MODERATOR
      ? '/moderator'
      : '/dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-2">
          You don't have permission to access this page.
        </p>
        {user && (
          <p className="text-sm text-gray-400 mb-6">
            Your role is <span className="font-semibold text-gray-600">{user.role}</span>
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href={dashboardHref}
            className="inline-flex items-center justify-center h-10 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
