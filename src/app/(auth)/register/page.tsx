/**
 * @file app/(auth)/register/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Registration page with name, email, password, and confirm
 *   password fields. Validates with Zod, shows inline errors, and redirects
 *   to client dashboard on success via useAuth.register().
 */

'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap, User, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerSchema, type RegisterInput } from '@/schemas/authSchema'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getApiError } from '@/lib/utils'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data)
    } catch (e) {
      toast.error(getApiError(e))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-brand-700">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            AdFlow Pro
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Start posting verified ads today</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full name"
              type="text"
              placeholder="Ali Hassan"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="ali@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
            <p className="text-xs text-gray-400">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>.
            </p>
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
