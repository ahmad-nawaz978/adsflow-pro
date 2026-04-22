/**
 * @file app/(public)/faq/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Frequently Asked Questions page covering ad submission,
 *   payment process, moderation, packages, and expiry rules.
 */

import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = { title: 'FAQ — AdFlow Pro' }

const FAQS = [
  { q: 'How do I post an ad?', a: 'Create a free account, fill in your ad details, add media URLs, select a package, and submit. Our moderators will review within 24 hours.' },
  { q: 'What payment methods are accepted?', a: 'We accept Easypaisa, JazzCash, bank transfer, HBL Konnect, UBL Omni, and cash. After payment, submit the transaction reference and an optional screenshot.' },
  { q: 'How long does moderation take?', a: 'Typically within 24 hours. Once approved, you will be asked to submit payment. After admin verifies the payment, your ad goes live.' },
  { q: 'What happens when my ad expires?', a: 'Expired ads are automatically hidden from public listings. You will receive a notification 48 hours before expiry.' },
  { q: 'Can I edit my ad after submitting?', a: 'You can edit ads in Draft or Rejected status. Published ads cannot be edited — contact support for critical changes.' },
  { q: 'What media formats are supported?', a: 'We support direct image URLs (HTTPS), YouTube video links (thumbnails auto-generated), and Cloudinary CDN links. No direct file uploads.' },
  { q: 'How is my ad ranked in search results?', a: 'Ranking is based on package weight, featured status, freshness, admin boost, and verified seller status. Premium packages rank highest.' },
  { q: 'What if my payment is rejected?', a: 'You will receive a notification with the rejection reason. You can resubmit with the correct transaction reference or contact support.' },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-10">Everything you need to know about using AdFlow Pro.</p>
        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
