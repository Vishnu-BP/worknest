/**
 * @file env.ts — Environment variable validation and export
 * @module server/config
 *
 * Validates all required environment variables at startup using Zod.
 * If any variable is missing or malformed, the server fails fast with
 * a clear error message instead of crashing later with a cryptic error.
 * Must be imported before any other module that needs env vars.
 *
 * @dependencies zod, dotenv
 * @related server/.env.example — lists all required variables
 */

import 'dotenv/config'

import { z } from 'zod'

// ─── Schema ────────────────────────────────────────────────────

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database — Supabase PostgreSQL
  DATABASE_URL: z
    .string()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),
  DIRECT_DATABASE_URL: z
    .string()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),

  // Supabase
  SUPABASE_URL: z.string().url('Must be a valid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Optional — not needed until later phases
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
})

// ─── Validate & Export ─────────────────────────────────────────

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('[CONFIG] Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export type Env = z.infer<typeof envSchema>
