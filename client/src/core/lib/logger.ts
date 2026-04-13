/**
 * @file logger.ts — Client-side tagged logger
 * @module client/core/lib
 *
 * Same pattern as the server logger — createLogger(tag) returns
 * { info, warn, error, debug }. Tags enable filtering in browser
 * DevTools console. Debug is suppressed outside development.
 *
 * @dependencies none
 * @related server/src/core/utils/logger.ts — server equivalent
 */

// ─── Types ─────────────────────────────────────────────────────

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

export function createLogger(tag: LogTag): Logger {
  const prefix = `[${tag}]`

  const formatArgs = (message: string, context?: unknown): unknown[] =>
    context !== undefined ? [prefix, message, context] : [prefix, message]

  return {
    info: (message, context) => console.info(...formatArgs(message, context)),
    warn: (message, context) => console.warn(...formatArgs(message, context)),
    error: (message, context) => console.error(...formatArgs(message, context)),
    debug: (message, context) => {
      if (import.meta.env.DEV) {
        console.debug(...formatArgs(message, context))
      }
    },
  }
}
