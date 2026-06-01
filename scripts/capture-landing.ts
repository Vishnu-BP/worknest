/**
 * @file capture-landing.ts — Capture WorkNest's own landing at localhost:5173/
 * @module scripts
 *
 * Assumes the Vite dev server is already running. Usage:
 *   npm run capture:landing
 *
 * @dependencies playwright, ./capture
 */

import { capture } from './capture'

const url = process.env.LANDING_URL ?? 'http://localhost:5173/'
// Theme: "dark" | "light" | "both". Defaults to both so iter-4+ captures
// always have the side-by-side comparison available.
const mode = process.env.LANDING_THEME ?? 'both'

async function main(): Promise<void> {
  if (mode === 'both') {
    await capture({ url, slug: 'landing', theme: 'dark' })
    await capture({ url, slug: 'landing', theme: 'light' })
  } else if (mode === 'dark' || mode === 'light') {
    await capture({ url, slug: 'landing', theme: mode })
  } else {
    throw new Error(`LANDING_THEME must be 'dark' | 'light' | 'both' (got ${mode})`)
  }
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
