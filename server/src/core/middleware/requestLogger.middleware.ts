/**
 * @file requestLogger.middleware.ts — HTTP request/response logger
 * @module server/middleware
 *
 * Logs every request with method, path, status code, and response time.
 * Hooks into the response 'finish' event to capture the final status code
 * (which isn't known when the request first arrives). Skipped in test
 * environment to keep test output clean.
 *
 * @dependencies server/src/utils/logger
 * @related server/src/middleware/errorHandler.middleware.ts — logs errors separately
 */

import type { NextFunction, Request, Response } from 'express'

import { env } from '../config'
import { createLogger } from '../utils'

const log = createLogger('MW')

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip logging in test environment to keep test output clean
  if (env.NODE_ENV === 'test') {
    next()
    return
  }

  const start = Date.now()

  // 'finish' fires after the response has been sent to the client
  res.on('finish', () => {
    const duration = Date.now() - start
    log.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
  })

  next()
}
