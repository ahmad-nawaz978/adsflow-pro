/**
 * @file middleware.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Simplified middleware - just passes user info via headers.
 *   Auth protection is handled client-side inside each layout instead.
 */

import { NextRequest, NextResponse } from 'next/server'

function decodeJwtPayload(token: string): { id: string; role: string; name: string; email: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    const json = Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adflow_token')?.value

  if (token) {
    const payload = decodeJwtPayload(token)
    if (payload && payload.exp * 1000 > Date.now()) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.id)
      requestHeaders.set('x-user-role', payload.role)
      requestHeaders.set('x-user-name', payload.name || '')
      requestHeaders.set('x-user-email', payload.email || '')
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/moderator/:path*', '/admin/:path*', '/api/:path*'],
}
