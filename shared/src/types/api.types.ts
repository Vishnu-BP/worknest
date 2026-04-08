/**
 * @file api.types.ts — API response wrapper types
 * @module shared/types
 *
 * Generic response types used by all API endpoints. Every successful
 * response wraps data in ApiSuccessResponse. Errors use ApiErrorResponse.
 * Paginated endpoints use PaginatedResponse with offset-based pagination.
 *
 * @dependencies none
 * @related docs/api-design.md — defines the response format standard
 */

// ─── Success Responses ─────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  readonly data: T
}

// ─── Error Responses ───────────────────────────────────────────

export interface ApiErrorResponse {
  readonly error: string
  readonly message: string
  readonly details?: Record<string, unknown>
}

// ─── Paginated Responses ───────────────────────────────────────

export interface PaginationMeta {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
}

export interface PaginatedResponse<T> {
  readonly data: T[]
  readonly pagination: PaginationMeta
}
