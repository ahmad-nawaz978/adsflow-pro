/**
 * @file app/api/auth/register/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description POST /api/auth/register
 *   Creates a new client account. Validates input with Zod, hashes password
 *   with bcrypt, stores user and seller profile in Supabase, returns JWT.
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/schemas/authSchema'
import { supabaseServer } from '@/lib/supabase/server'
import { hashPassword, signToken } from '@/lib/auth'
import { err } from '@/lib/apiHelpers'
import type { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── Validate input ──
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { name, email, password } = result.data

    // ── Check duplicate email ──
    const { data: existing } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return err('An account with this email already exists', 409)
    }

    // ── Hash password ──
    const password_hash = await hashPassword(password)

    // ── Create user ──
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash,
        role: 'client',
        status: 'active',
      })
      .select('id, name, email, role')
      .single()

    if (userError || !user) {
      console.error('[REGISTER] user insert error:', userError)
      return err('Failed to create account. Please try again.', 500)
    }

    // ── Create seller profile ──
    await supabaseServer.from('seller_profiles').insert({
      user_id: user.id,
      display_name: name,
    })

    // ── Sign JWT ──
    const token = signToken({ ...user, role: user.role as Role })

    // ── Set HttpOnly cookie ──
    const response = NextResponse.json({
      success: true,
      data: { user, token },
      message: 'Account created successfully',
    })

    response.cookies.set('adflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return err('Internal server error', 500)
  }
}
