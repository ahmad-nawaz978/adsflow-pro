/**
 * @file app/(public)/terms/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Terms of Service page with platform usage policies.
 */

import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
export const metadata: Metadata = { title: 'Terms of Service — AdFlow Pro' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: March 2026</p>
        {[
          { title: '1. Acceptance of Terms', body: 'By using AdFlow Pro, you agree to these Terms. If you do not agree, do not use the platform.' },
          { title: '2. Ad Content Policy', body: 'All ads must be legal, accurate, and non-deceptive. Prohibited content includes illegal goods, adult content, misleading pricing, and spam.' },
          { title: '3. Payment Policy', body: 'Payments are non-refundable once an ad is published. Fraudulent payment proofs will result in immediate account termination.' },
          { title: '4. Moderation', body: 'AdFlow Pro reserves the right to reject, remove, or modify any listing that violates our guidelines. Rejected ads may resubmit after addressing the reason.' },
          { title: '5. Account Responsibility', body: 'You are responsible for all activity under your account. Do not share login credentials. Report suspected unauthorized access immediately.' },
          { title: '6. Limitations', body: 'AdFlow Pro is not liable for transactions between buyers and sellers. Always verify listings before making any payment to a seller.' },
        ].map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h2>
            <p className="text-gray-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
