/**
 * @file useTasks.ts — Fetch tasks for a project
 * @module client/features/task/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/projects/:projectId/tasks.
 * Returns all tasks for the project (filtering is done client-side via filterStore).
 * Uses short stale time (30s) since tasks change frequently.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/task/task.routes.ts — GET /tasks
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Task } from '@worknest/shared'

import { api, taskKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useTasks(slug: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<Task[]>>(
        `/api/workspaces/${slug}/projects/${projectId}/tasks`,
      ),
    staleTime: STALE_TIMES.SHORT,
    select: (response) => response.data,
    enabled: !!slug && !!projectId,
  })
}
