/**
 * @file index.ts — Drizzle ORM client initialization
 * @module server/db
 *
 * Creates the Drizzle ORM client using postgres.js as the driver.
 * Uses the pooled DATABASE_URL (port 6543) for application queries.
 * The schema import enables Drizzle's relational query API
 * (e.g., db.query.tasks.findMany({ with: { project: true } })).
 *
 * @dependencies drizzle-orm, postgres, server/src/config
 * @related server/src/db/schema/ — table definitions and relations
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../config'
import * as schema from './schema'

// ─── Database Connection ───────────────────────────────────────

/** Raw postgres.js client — exported for graceful shutdown */
export const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/** Drizzle ORM instance with schema for relational queries */
export const db = drizzle(client, { schema })
