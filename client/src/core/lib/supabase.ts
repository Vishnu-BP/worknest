/**
 * @file supabase.ts — Supabase client initialization
 * @module client/core/lib
 *
 * Creates the Supabase client for authentication (signup, login, OAuth,
 * session management) and future Realtime subscriptions (Phase 11).
 * Uses the anon key — safe to expose in browser code. The service role
 * key is NEVER used client-side.
 *
 * @dependencies @supabase/supabase-js
 * @related server/src/core/middleware/auth.middleware.ts — verifies tokens issued by this client
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
