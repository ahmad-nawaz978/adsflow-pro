/**
 * @file app/api/auth/login/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description POST /api/auth/login
 *   Authenticates a user by email and password. Validates credentials,
 *   compares bcrypt hash, returns JWT in response body and HttpOnly cookie.
 */

import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/schemas/authSchema'
import { supabaseServer } from '@/lib/supabase/server'
import { comparePassword, signToken } from '@/lib/auth'
import { err } from '@/lib/apiHelpers'
import type { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── Validate input ──
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return err('Validation failed', 400, result.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { email, password } = result.data

    // ── Find user ──
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('id, name, email, role, status, password_hash')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error || !user) {
      return err('Invalid email or password', 401)
    }

    // ── Check account status ──
    if (user.status !== 'active') {
      return err('Your account has been suspended. Please contact support.', 403)
    }

    // ── Verify password ──
    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return err('Invalid email or password', 401)
    }

    // ── Build safe user object (no password) ──
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role as Role }

    // ── Sign JWT ──
    const token = signToken(safeUser)

    const response = NextResponse.json({
      success: true,
      data: { user: safeUser, token },
      message: 'Login successful',
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
    console.error('[LOGIN ERROR]', error)
    return err('Internal server error', 500)
  }
}
