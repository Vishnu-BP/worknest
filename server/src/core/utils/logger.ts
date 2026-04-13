/**
 * @file logger.ts — Tagged logger factory for structured console output
 * @module server/utils
 *
 * Provides createLogger(tag) which returns an object with info, warn, error,
 * and debug methods. All output is prefixed with [TAG] for easy filtering
 * in production monitoring tools (Sentry, CloudWatch, etc.).
 * Debug logs are suppressed outside development to reduce noise.
 *
 * @dependencies none (uses native console)
 * @related CLAUDE.md — "Tagged Loggers" section defines tag conventions
 */

// ─── Types ─────────────────────────────────────────────────────

/** Standardized log tags used across the entire codebase */
export type LogTag =
  | 'AUTH'
  | 'API'
  | 'BOARD'
  | 'WS'
  | 'STORE'
  | 'UI'
  | 'DB'
  | 'RBAC'
  | 'MAIL'
  | 'MW'

export interface Logger {
  info: (message: string, context?: unknown) => void
  warn: (message: string, context?: unknown) => void
  error: (message: string, context?: unknown) => void
  debug: (message: string, context?: unknown) => void
}

// ─── Factory ───────────────────────────────────────────────────

/**
 * Creates a tagged logger instance. Every log line is prefixed with
 * the tag in brackets for easy grep/filter in log aggregators.
 *
 * Usage:
 *   const log = createLogger('MW')
 *   log.info('Request received', { method: 'GET', path: '/api/health' })
 *   // Output: [MW] Request received { method: 'GET', path: '/api/health' }
 */
export function createLogger(tag: LogTag): Logger {
  const prefix = `[${tag}]`

  const formatArgs = (message: string, context?: unknown): unknown[] =>
    context !== undefined ? [prefix, message, context] : [prefix, message]

  return {
    info: (message, context) => console.info(...formatArgs(message, context)),
    warn: (message, context) => console.warn(...formatArgs(message, context)),
    error: (message, context) => console.error(...formatArgs(message, context)),
    debug: (message, context) => {
      // Only log debug messages in development to reduce production noise
      if (process.env['NODE_ENV'] === 'development') {
        console.debug(...formatArgs(message, context))
      }
    },
  }
}
