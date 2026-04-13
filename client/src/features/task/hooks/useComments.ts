/**
 * @file useComments.ts — Fetch comments for a task (paginated)
 * @module client/features/task/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/tasks/:taskId/comments.
 * Returns paginated comments ordered by newest first.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/comment/comment.routes.ts — GET /comments
 */

import { useQuery } from '@tanstack/react-query'

import type { Comment, PaginatedResponse } from '@worknest/shared'

import { api, commentKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useComments(slug: string | undefined, taskId: string | undefined, page: number = 1) {
  return useQuery({
    queryKey: [...commentKeys.byTask(taskId ?? ''), page],
    queryFn: () =>
      api.get<PaginatedResponse<Comment>>(
        `/api/workspaces/${slug}/tasks/${taskId}/comments?page=${page}&limit=20`,
      ),
    staleTime: STALE_TIMES.MEDIUM,
    enabled: !!slug && !!taskId,
  })
}
