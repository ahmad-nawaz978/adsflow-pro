/**
 * @file app/(public)/packages/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public packages page. Shows all available listing packages with
 *   features, pricing, duration, and a CTA to register. Server-side rendered
 *   with 1-hour ISR cache.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Star, Zap } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Packages — AdFlow Pro' }

async function getPackages() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/packages`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

const PACKAGE_FEATURES: Record<string, string[]> = {
  Basic: [
    '7-day active listing',
    'Standard search ranking',
    'Up to 5 media URLs',
    'Contact info visible',
    'Moderation review included',
  ],
  Standard: [
    '15-day active listing',
    'Priority ranking ×2',
    'Up to 5 media URLs',
    'Category featured placement',
    'Moderation review included',
    'Manual listing refresh',
  ],
  Premium: [
    '30-day active listing',
    'Top ranking ×3',
    'Up to 5 media URLs',
    'Homepage featured placement',
    'Moderation priority review',
    'Auto-refresh every 3 days',
    'Premium seller badge',
  ],
}

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Choose Your Package</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Pick the plan that fits your needs. All packages include moderation review,
            full media support, and verified listing badge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg: any) => {
            const features = PACKAGE_FEATURES[pkg.name] ?? []
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border-2 p-7 flex flex-col ${
                  pkg.is_featured
                    ? 'border-brand-500 shadow-lg ring-4 ring-brand-100'
                    : 'border-gray-200'
                }`}
              >
                {pkg.is_featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Star className="w-3.5 h-3.5 fill-white" /> Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${pkg.is_featured ? 'bg-brand-600' : 'bg-gray-100'}`}>
                    <Zap className={`w-5 h-5 ${pkg.is_featured ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{pkg.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-sm text-gray-400">/ listing</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{pkg.duration_days} days duration</p>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.is_featured ? 'text-brand-600' : 'text-green-500'}`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                    pkg.is_featured
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-brand-400 hover:text-brand-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )
          })}
        </div>

        {/* Trust note */}
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            {[
              { step: '1', text: 'Create your ad draft' },
              { step: '2', text: 'Moderator reviews content' },
              { step: '3', text: 'Submit payment proof' },
              { step: '4', text: 'Admin verifies & publishes' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
