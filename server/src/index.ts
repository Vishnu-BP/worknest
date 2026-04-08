/**
 * @file index.ts — Express server entry point
 * @module server
 *
 * Bootstraps the Express application and starts listening on the configured port.
 * Imports env config first to validate all environment variables at startup.
 * This file only handles server startup — app configuration lives in app.ts (Phase 3).
 *
 * @dependencies express, @worknest/shared, server/src/config
 * @related server/src/app.ts — Express app setup (created in Phase 3)
 */

import express from 'express'

import { TASK_STATUS } from '@worknest/shared'

import { env } from './config'

// ─── App Setup ─────────────────────────────────────────────────

const app = express()

app.use(express.json())

// ─── Health Check ──────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    data: {
      message: 'WorkNest API',
      statuses: Object.values(TASK_STATUS),
    },
  })
})

// ─── Start Server ──────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`[SERVER] WorkNest API running on port ${env.PORT}`)
})
