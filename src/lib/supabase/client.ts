/**
 * @file lib/supabase/client.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Supabase browser-side client using the ANON key.
 *   Safe for client components. Respects Row Level Security policies.
 *   Used for real-time subscriptions and public data queries from the browser.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Singleton pattern — prevents multiple client instances in React
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  }
  return clientInstance
}

// Default export for convenience
export const supabase = getSupabaseClient()
