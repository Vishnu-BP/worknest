/**
 * @file useLabels.ts — Fetch workspace labels
 * @module client/features/label/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/labels.
 * Returns all labels for the workspace. Long stale time since
 * labels rarely change.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/label/label.routes.ts — GET /labels
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Label } from '@worknest/shared'

import { api, labelKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useLabels(slug: string | undefined) {
  return useQuery({
    queryKey: labelKeys.byWorkspace(slug ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<Label[]>>(`/api/workspaces/${slug}/labels`),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug,
  })
}
