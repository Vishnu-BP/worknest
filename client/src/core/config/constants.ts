/**
 * @file constants.ts — Application-wide constants
 * @module client/core/config
 *
 * Shared constants used throughout the frontend. No magic numbers
 * or strings anywhere in the codebase — everything goes here.
 *
 * @dependencies none
 * @related CLAUDE.md — "No magic numbers" coding discipline
 */

/** Application display name */
export const APP_NAME = 'WorkNest'

/** LocalStorage key for persisting last visited workspace slug */
export const LAST_WORKSPACE_KEY = 'worknest:lastWorkspaceSlug'

/** Default stale times for TanStack Query (in milliseconds) */
export const STALE_TIMES = {
  /** Workspaces and labels rarely change — cache for 5 minutes */
  LONG: 5 * 60 * 1000,
  /** Tasks change frequently — 30 second cache */
  SHORT: 30 * 1000,
  /** Activity and comments — 30 second cache */
  MEDIUM: 30 * 1000,
} as const
