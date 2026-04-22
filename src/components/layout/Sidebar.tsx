/**
 * @file components/layout/Sidebar.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Dashboard sidebar with role-based navigation links, collapse
 *   toggle, user avatar with initials, and active link highlighting.
 *   Uses Zustand uiStore for open/closed state.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, PlusCircle, CreditCard, Bell,
  ClipboardList, BarChart3, Users, Tag, Package, Activity,
  ChevronLeft, ChevronRight, Zap, LogOut,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, PlusCircle, CreditCard, Bell,
  ClipboardList, BarChart3, Users, Tag, Package, Activity,
}

const NAV_BY_ROLE: Record<string, { label: string; href: string; icon: string }[]> = {
  client: [
    { label: 'Dashboard',     href: '/dashboard',           icon: 'LayoutDashboard' },
    { label: 'My Ads',        href: '/dashboard/ads',       icon: 'FileText' },
    { label: 'Post New Ad',   href: '/dashboard/ads/new',   icon: 'PlusCircle' },
    { label: 'Payments',      href: '/dashboard/payments',  icon: 'CreditCard' },
    { label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell' },
  ],
  moderator: [
    { label: 'Review Queue',  href: '/moderator',           icon: 'ClipboardList' },
  ],
  admin: [
    { label: 'Overview',      href: '/admin',               icon: 'LayoutDashboard' },
    { label: 'Payment Queue', href: '/admin/payments',      icon: 'CreditCard' },
    { label: 'Analytics',     href: '/admin/analytics',     icon: 'BarChart3' },
    { label: 'Users',         href: '/admin/users',         icon: 'Users' },
    { label: 'Categories',    href: '/admin/categories',    icon: 'Tag' },
    { label: 'Packages',      href: '/admin/packages',      icon: 'Package' },
    { label: 'System Health', href: '/admin/health',        icon: 'Activity' },
  ],
  super_admin: [
    { label: 'Overview',      href: '/admin',               icon: 'LayoutDashboard' },
    { label: 'Payment Queue', href: '/admin/payments',      icon: 'CreditCard' },
    { label: 'Analytics',     href: '/admin/analytics',     icon: 'BarChart3' },
    { label: 'Users',         href: '/admin/users',         icon: 'Users' },
    { label: 'Categories',    href: '/admin/categories',    icon: 'Tag' },
    { label: 'Packages',      href: '/admin/packages',      icon: 'Package' },
    { label: 'System Health', href: '/admin/health',        icon: 'Activity' },
  ],
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const { logout } = useAuth()

  if (!user) return null

  const navItems = NAV_BY_ROLE[user.role] ?? NAV_BY_ROLE['client']

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sidebar z-30',
        'flex flex-col transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        {sidebarOpen && (
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            AdFlow Pro
          </Link>
        )}
        {!sidebarOpen && (
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
            !sidebarOpen && 'hidden'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Collapse button when closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mt-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const IconComp = ICON_MAP[item.icon] ?? LayoutDashboard
            const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/moderator' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <IconComp className={cn('flex-shrink-0 w-5 h-5', isActive ? 'text-brand-600' : 'text-gray-400')} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className={cn('p-3 border-t border-gray-100', !sidebarOpen && 'flex justify-center')}>
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
