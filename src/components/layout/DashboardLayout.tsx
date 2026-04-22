/**
 * @file components/layout/DashboardLayout.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Wrapper layout for all dashboard, moderator, and admin pages.
 *   Renders the Sidebar + top header bar + main content area with correct
 *   left margin offset based on sidebar open state.
 */

'use client'

import { Bell, Search } from 'lucide-react'
import Link from 'next/link'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarOpen } = useUiStore()
  const { unreadNotifications } = useUiStore()
  const { user } = useAuthStore()

  const notifHref =
    user?.role === 'client' ? '/dashboard/notifications'
    : user?.role === 'admin' || user?.role === 'super_admin' ? '/admin'
    : '/moderator'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main area */}
      <div
        className={cn(
          'transition-all duration-200',
          sidebarOpen ? 'ml-64' : 'ml-[72px]'
        )}
      >
        {/* Top header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div>
            {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={notifHref}
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
