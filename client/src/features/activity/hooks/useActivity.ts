/**
 * @file useActivity.ts — Fetch workspace activity feed (paginated)
 * @module client/features/activity/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/activity.
 * Returns paginated activity entries with actor user profiles.
 * Supports optional entity_type filter.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/activity/activity.routes.ts — GET /activity
 */

import { useQuery } from '@tanstack/react-query'

import type { ActivityLog, EntityType, PaginatedResponse } from '@worknest/shared'

import { api, activityKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

// ─── Types ─────────────────────────────────────────────────────

interface ActivityWithActor extends ActivityLog {
  actor: {
    id: string
    email: string
    full_name: string | null
  }
}

type ActivityResponse = PaginatedResponse<ActivityWithActor>

// ─── Hook ──────────────────────────────────────────────────────

export function useActivity(
  slug: string | undefined,
  page: number = 1,
  entityType?: EntityType,
) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', '20')
  if (entityType) params.set('entity_type', entityType)

  return useQuery({
    queryKey: [...activityKeys.byWorkspace(slug ?? ''), page, entityType],
    queryFn: () =>
      api.get<ActivityResponse>(
        `/api/workspaces/${slug}/activity?${params.toString()}`,
      ),
    staleTime: STALE_TIMES.MEDIUM,
    enabled: !!slug,
  })
}
