/**
 * @file lib/supabase/server.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Supabase server-side client using the SERVICE ROLE key.
 *   This client bypasses Row Level Security (RLS) and has full DB access.
 *   ONLY import this in server-side code: API routes, middleware, cron jobs.
 *   NEVER import this in client components or expose to the browser.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseServiceKey) throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY')

// ─── Server client (bypasses RLS — admin-level access) ────────────────────────
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
