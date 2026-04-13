/**
 * @file slug.ts — URL-friendly slug generation with uniqueness check
 * @module server/core/utils
 *
 * Generates URL-safe slugs from workspace names. Handles special
 * characters, whitespace, and ensures uniqueness by querying the
 * workspaces table. If a slug collision occurs, appends an
 * incrementing counter (acme-corp → acme-corp-2 → acme-corp-3).
 *
 * @dependencies drizzle-orm, server/src/core/db
 * @related server/src/modules/workspace/workspace.service.ts — calls generateSlug
 */

import { eq } from 'drizzle-orm'

import { db } from '../db'
import { workspaces } from '../db/schema'

// ─── Constants ─────────────────────────────────────────────────

const MAX_SLUG_LENGTH = 50
const MAX_UNIQUENESS_ATTEMPTS = 20

// ─── Slug Generation ───────────────────────────────────────────

/**
 * Converts a name into a URL-friendly slug and ensures it's unique
 * in the workspaces table. Retries with an incrementing counter
 * if the slug already exists.
 *
 * Examples:
 *   "Acme Corp"       → "acme-corp"
 *   "  Hello World! " → "hello-world"
 *   "Acme Corp" (dup) → "acme-corp-2"
 */
export async function generateSlug(name: string): Promise<string> {
  const baseSlug = slugify(name)

  // Try the base slug first
  const isAvailable = await isSlugAvailable(baseSlug)
  if (isAvailable) return baseSlug

  // Slug taken — try with incrementing counter
  for (let counter = 2; counter <= MAX_UNIQUENESS_ATTEMPTS; counter++) {
    const candidate = `${baseSlug}-${counter}`
    const available = await isSlugAvailable(candidate)
    if (available) return candidate
  }

  // Extremely unlikely — 20 collisions means something is wrong
  throw new Error(`Could not generate unique slug for "${name}" after ${MAX_UNIQUENESS_ATTEMPTS} attempts`)
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Converts a string into a URL-safe slug.
 * - Lowercases everything
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses multiple consecutive hyphens into one
 * - Trims leading/trailing hyphens
 * - Truncates to MAX_SLUG_LENGTH
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
}

/** Checks if a slug is available (not already used by any workspace) */
async function isSlugAvailable(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1)

  return !existing
}
