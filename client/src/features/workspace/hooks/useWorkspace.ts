/**
 * @file useWorkspace.ts — Fetch a single workspace by slug
 * @module client/features/workspace/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug. Returns
 * workspace details for the current workspace context. Used in
 * WorkspaceLayout header, settings page, and breadcrumbs.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/workspace/workspace.routes.ts — GET /workspaces/:slug
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Workspace } from '@worknest/shared'

import { api, workspaceKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useWorkspace(slug: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(slug ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<Workspace>>(`/api/workspaces/${slug}`),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug,
  })
}
