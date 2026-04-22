/**
 * @file components/layout/Navbar.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public site navigation bar with logo, main links, and
 *   auth buttons. Shows different CTA for logged-in vs guest users.
 *   Responsive with mobile menu toggle.
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/constants'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Explore Ads', href: '/explore' },
  { label: 'Packages', href: '/packages' },
  { label: 'Categories', href: '/explore' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const dashboardHref =
    user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN
      ? '/admin'
      : user?.role === ROLES.MODERATOR
      ? '/moderator'
      : '/dashboard'

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            AdFlow Pro
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href={dashboardHref}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Post an Ad</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-2 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {isAuthenticated ? (
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="secondary" className="w-full" size="sm">Sign In</Button></Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full" size="sm">Post an Ad</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
