/**
 * @file health.routes.ts — Health check endpoint
 * @module server/routes
 *
 * Provides GET /health for monitoring services (UptimeRobot) and
 * deployment verification. Pings the database to distinguish between
 * "app is up, DB is down" (degraded) vs "app is down" (no response).
 * Always returns 200 so monitoring tools see the app as reachable
 * even when the database is temporarily unavailable.
 *
 * @dependencies express, drizzle-orm, server/src/db
 * @related server/src/routes/index.ts — mounts this router
 */

import { Router } from 'express'
import { sql } from 'drizzle-orm'

import { db } from '../db'
import { readLimiter } from '../middleware'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

router.get('/health', readLimiter, async (_req, res) => {
  try {
    // Ping the database to verify the connection is alive
    await db.execute(sql`SELECT 1`)

    res.json({
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // Database is unreachable — report degraded but still respond 200
    // so monitoring tools know the Express server itself is running
    res.json({
      data: {
        status: 'degraded',
        database: false,
        timestamp: new Date().toISOString(),
      },
    })
  }
})

export { router as healthRouter }
