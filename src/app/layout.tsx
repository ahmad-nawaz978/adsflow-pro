/**
 * @file app/layout.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Root Next.js layout. Sets up Inter font, global metadata,
 *   TanStack QueryProvider, React Hot Toast, and the auth hydration wrapper.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/components/providers/QueryProvider'
import AuthHydrator from '@/components/providers/AuthHydrator'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'AdFlow Pro', template: '%s | AdFlow Pro' },
  description: 'Pakistan\'s professional sponsored listing marketplace. Post ads, get verified, reach buyers.',
  keywords: ['classified ads', 'buy sell', 'Pakistan ads', 'adflow'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <QueryProvider>
          <AuthHydrator>
            {children}
          </AuthHydrator>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#1f2937',
                color: '#f9fafb',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
