/**
 * @file lib/auth.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description JWT helper utilities: sign tokens, verify tokens, extract from
 *   request headers, and hash/compare passwords with bcrypt.
 *   Used in API routes and middleware — server-side only.
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { AuthUser } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) throw new Error('Missing env: JWT_SECRET')

// ─── JWT ──────────────────────────────────────────────────────────────────────

/**
 * Sign a new JWT with user payload
 */
export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET!,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  )
}

/**
 * Verify and decode a JWT token.
 * Returns null if the token is invalid, expired, or malformed.
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as AuthUser & { iat: number; exp: number }
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    }
  } catch {
    return null
  }
}

/**
 * Extract bearer token from an Authorization header string.
 * Expected format: "Bearer <token>"
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7).trim() || null
}

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * Hash a plain-text password using bcrypt (12 rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Compare a plain-text password against a bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
