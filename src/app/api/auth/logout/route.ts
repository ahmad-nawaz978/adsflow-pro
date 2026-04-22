/**
 * @file app/api/auth/logout/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description POST /api/auth/logout
 *   Clears the adflow_token HttpOnly cookie to log the user out server-side.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  response.cookies.set('adflow_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
