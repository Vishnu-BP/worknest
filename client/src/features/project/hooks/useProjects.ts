/**
 * @file useProjects.ts — Fetch all projects in a workspace
 * @module client/features/project/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/projects.
 * Returns non-archived projects ordered by creation date.
 * Used in sidebar project list and workspace dashboard grid.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/project/project.routes.ts — GET /projects
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Project } from '@worknest/shared'

import { api, projectKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useProjects(slug: string | undefined) {
  return useQuery({
    queryKey: projectKeys.byWorkspace(slug ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<Project[]>>(
        `/api/workspaces/${slug}/projects`,
      ),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug,
  })
}
