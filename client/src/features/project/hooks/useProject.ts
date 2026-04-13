/**
 * @file useProject.ts — Fetch a single project by ID
 * @module client/features/project/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/projects/:projectId.
 * Used in project board page and project settings.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/project/project.routes.ts — GET /projects/:projectId
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Project } from '@worknest/shared'

import { api, projectKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useProject(slug: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<Project>>(
        `/api/workspaces/${slug}/projects/${projectId}`,
      ),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug && !!projectId,
  })
}
