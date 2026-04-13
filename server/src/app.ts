/**
 * @file app.ts — Express application configuration
 * @module server
 *
 * Creates the Express instance and registers all middleware in the
 * correct order. Separated from index.ts so Supertest can import the
 * app without starting the HTTP server (critical for API testing).
 *
 * Middleware chain order:
 *   1. CORS (allow frontend origin)
 *   2. JSON body parser
 *   3. Request logger (timing + status)
 *   4. API routes (/api/...)
 *   5. 404 catch-all (unmatched routes)
 *   6. Error handler (LAST — catches all errors)
 *
 * Rate limiters are applied per-route inside route files, not here.
 *
 * @dependencies express, server/src/middleware, server/src/routes, server/src/utils
 * @related server/src/index.ts — imports this app and calls listen()
 */

import express from 'express'

import {
  corsMiddleware,
  errorHandlerMiddleware,
  requestLoggerMiddleware,
} from './core/middleware'
import { healthRouter } from './core/health'
import { notFound } from './core/utils'
import { authRouter } from './modules/auth'
import { workspaceRouter } from './modules/workspace'
import { memberRouter } from './modules/member'
import { projectRouter } from './modules/project'
import { taskRouter } from './modules/task'

// ─── Create App ────────────────────────────────────────────────

const app = express()

// ─── Global Middleware (order matters) ──────────────────────────

// 1. CORS — must be first so preflight OPTIONS requests get headers
app.use(corsMiddleware)

// 2. Parse JSON request bodies into req.body
app.use(express.json())

// 3. Log every request with method, path, status, and duration
app.use(requestLoggerMiddleware)

// ─── Routes ────────────────────────────────────────────────────

// ─── API Routes (/api prefix) ──────────────────────────────────
// Each module registers its own routes. New modules are added here.
app.use('/api', healthRouter)
app.use('/api', authRouter)
app.use('/api', workspaceRouter)
app.use('/api', memberRouter)
app.use('/api', projectRouter)
app.use('/api', taskRouter)

// ─── 404 Catch-All ─────────────────────────────────────────────

// Any request that didn't match a route gets a proper NotFound error
// which the error handler below formats into ApiErrorResponse
app.use((_req, _res, next) => {
  next(notFound('The requested resource was not found'))
})

// ─── Error Handler (MUST be last) ──────────────────────────────

app.use(errorHandlerMiddleware)

// ─── Export ────────────────────────────────────────────────────

export { app }
