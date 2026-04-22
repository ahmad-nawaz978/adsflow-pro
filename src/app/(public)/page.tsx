/**
 * @file app/(public)/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public landing page. Features hero section with CTA, stats bar,
 *   package highlight cards, featured ads preview, and a learning question widget
 *   that also keeps Supabase alive via GET /api/questions/random.
 */

import Link from 'next/link'
import { Zap, Shield, Clock, TrendingUp, ChevronRight, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

async function getFeaturedAds() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/ads?page_size=6`, { next: { revalidate: 300 } })
    const json = await res.json()
    return json.data?.data ?? []
  } catch { return [] }
}

async function getPackages() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/packages`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

async function getRandomQuestion() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/questions/random`, { cache: 'no-store' })
    const json = await res.json()
    return json.data
  } catch { return null }
}

export default async function HomePage() {
  const [packages, question] = await Promise.all([getPackages(), getRandomQuestion()])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            Pakistan&apos;s #1 Moderated Ad Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Sell Faster with<br />
            <span className="text-yellow-300">Verified Listings</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Post ads that get noticed. Every listing is reviewed, verified, and ranked
            for maximum visibility. Trusted by thousands of buyers and sellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Post Your Ad Now
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '10,000+', label: 'Active Listings' },
            { value: '50,000+', label: 'Happy Users' },
            { value: '100%', label: 'Moderated' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold text-brand-400">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why AdFlow */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Why AdFlow Pro?</h2>
          <p className="text-center text-gray-500 mb-10">Every ad is moderated, verified, and ranked for the best results.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Moderated Quality', desc: 'Every ad is reviewed by our moderators before going live. No spam, no scams.', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: TrendingUp, title: 'Smart Ranking', desc: 'Ads ranked by package strength, freshness, and featured status for maximum visibility.', color: 'text-brand-600', bg: 'bg-brand-50' },
              { icon: Clock, title: 'Package-Based Duration', desc: 'Choose Basic (7 days), Standard (15 days), or Premium (30 days) based on your needs.', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-card">
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      {packages.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-center text-gray-500 mb-10">Select the package that matches your listing goals.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg: any) => (
                <div
                  key={pkg.id}
                  className={`rounded-xl border p-6 ${pkg.is_featured ? 'border-brand-400 ring-2 ring-brand-200 bg-brand-50 relative' : 'border-gray-200 bg-white'}`}
                >
                  {pkg.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  <p className="text-3xl font-extrabold text-brand-600 mb-1">
                    PKR {Number(pkg.price).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">{pkg.duration_days} days listing</p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> {pkg.duration_days} days active</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority weight ×{pkg.weight}</li>
                    {pkg.is_featured && <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Homepage featured</li>}
                  </ul>
                  <Link
                    href="/register"
                    className={`block text-center font-semibold py-2.5 rounded-lg transition-colors ${pkg.is_featured ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Learning question widget (keeps DB alive) */}
      {question && (
        <section className="py-12 px-4 bg-gray-900">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Did You Know?</p>
            <h3 className="text-white text-lg font-semibold mb-3">{question.question}</h3>
            <p className="text-gray-400 text-sm">{question.answer}</p>
            <span className="inline-block mt-3 text-xs text-brand-400 bg-brand-900/40 px-3 py-1 rounded-full">{question.topic}</span>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Zap className="w-4 h-4 text-brand-400" /> AdFlow Pro
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AdFlow Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
