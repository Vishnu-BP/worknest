/**
 * @file api.ts — HTTP fetch wrapper with auth and global error handling
 * @module client/core/lib
 *
 * Central API client for all backend communication. Every request:
 *   1. Reads the current JWT from Supabase session
 *   2. Attaches it as Authorization: Bearer header
 *   3. Handles global errors (401→refresh/redirect, 403→toast, 500→toast)
 *
 * All hooks (TanStack Query wrappers) use this instead of raw fetch.
 * This ensures consistent auth, error handling, and base URL across
 * the entire frontend.
 *
 * @dependencies client/src/core/lib/supabase
 * @related server/src/core/middleware/auth.middleware.ts — verifies the JWT we attach
 */

import type { ApiErrorResponse } from '@worknest/shared'

import { supabase } from './supabase'
import { createLogger } from './logger'

// ─── Config ────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL as string

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_URL environment variable. Check client/.env')
}

const log = createLogger('API')

// ─── Core Fetch ────────────────────────────────────────────────

/**
 * Makes an authenticated HTTP request to the backend API.
 * Automatically attaches the JWT and handles common error patterns.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Get current session token from Supabase
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // ─── Global Error Handling ─────────────────────────────────

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorResponse | null

    // 401 — Token expired or invalid
    if (response.status === 401) {
      log.warn('Received 401, attempting token refresh')

      const { error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        // Refresh failed — session is dead, redirect to login
        log.error('Token refresh failed, signing out', { error: refreshError.message })
        // Import dynamically to avoid circular dependency
        const { cleanupOnSignOut } = await import('./cleanup')
        await cleanupOnSignOut()
        return undefined as T
      }

      // Refresh succeeded — retry the original request once
      log.info('Token refreshed, retrying request')
      return request<T>(endpoint, options)
    }

    // 403 — Authenticated but lacks permission
    if (response.status === 403) {
      log.warn('Permission denied', { endpoint })
      // Toast will be added when sonner is set up in Step 6
    }

    // 500+ — Server error
    if (response.status >= 500) {
      log.error('Server error', { status: response.status, endpoint })
      // Sentry logging added in Phase 12
    }

    // Throw the error for TanStack Query's onError handler
    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody,
    )
  }

  return response.json() as Promise<T>
}

// ─── Typed API Methods ─────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}

// ─── Error Class ───────────────────────────────────────────────

/** Custom error with HTTP status and structured error body */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorResponse | null,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
