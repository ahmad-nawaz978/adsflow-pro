/**
 * @file app/(public)/contact/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Contact page with basic contact information and support channels.
 */

import type { Metadata } from 'next'
import { Mail, MessageSquare } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
export const metadata: Metadata = { title: 'Contact Us — AdFlow Pro' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Contact Support</h1>
        <p className="text-gray-500 mb-10">We&apos;re here to help. Reach out via any of the channels below.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <Mail className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">Email Support</h2>
            <p className="text-sm text-gray-500">support@adflowpro.com</p>
            <p className="text-xs text-gray-400 mt-2">Response within 24 hours</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">WhatsApp</h2>
            <p className="text-sm text-gray-500">+92 300 0000000</p>
            <p className="text-xs text-gray-400 mt-2">Mon-Sat, 9am-6pm PKT</p>
          </div>
        </div>
      </div>
    </div>
  )
}
