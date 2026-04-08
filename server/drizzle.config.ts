/**
 * @file drizzle.config.ts — Drizzle Kit configuration
 * @module server
 *
 * Configures drizzle-kit for migration generation and database introspection.
 * Uses DIRECT_DATABASE_URL (port 5432) for migrations — the direct connection
 * is required because the pooler (port 6543) doesn't support DDL operations.
 *
 * @dependencies drizzle-kit, dotenv
 * @related server/src/db/schema/ — schema definitions used for migration diffing
 */

import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DIRECT_DATABASE_URL']!,
  },
  verbose: true,
  strict: true,
})
