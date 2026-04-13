/**
 * @file cors.middleware.ts — Cross-Origin Resource Sharing configuration
 * @module server/middleware
 *
 * Configures CORS to allow requests only from the frontend origin.
 * Without this, the browser blocks every API call from the React app
 * because frontend (Vercel/localhost:5173) and backend (Render/localhost:3001)
 * are different origins. Must be the FIRST middleware in the chain.
 *
 * @dependencies cors
 * @related server/src/config/env.ts — provides FRONTEND_URL
 */

import cors from 'cors'

import { env } from '../config'

export const corsMiddleware = cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
