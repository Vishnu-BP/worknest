/**
 * @file useWorkspaces.ts — Fetch all workspaces the user belongs to
 * @module client/features/workspace/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces. Returns the list of
 * workspaces the authenticated user is a member of. Used in the
 * WorkspaceSwitcher dropdown and home page redirect logic.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/workspace/workspace.routes.ts — GET /workspaces
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Workspace } from '@worknest/shared'

import { api, workspaceKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: () => api.get<ApiSuccessResponse<Workspace[]>>('/api/workspaces'),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
  })
}
