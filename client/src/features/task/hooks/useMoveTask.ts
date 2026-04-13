/**
 * @file useMoveTask.ts — Optimistic move task mutation (drag-and-drop)
 * @module client/features/task/hooks
 *
 * The most critical hook for Kanban board performance. Uses optimistic
 * updates so the user sees instant card movement — the server round-trip
 * happens invisibly in the background.
 *
 * Pattern (per CLAUDE.md — optimistic updates ONLY for drag-drop):
 *   onMutate:  snapshot cache → cancel refetches → update cache immediately
 *   onError:   restore snapshot → show error toast
 *   onSettled: invalidate cache (background refetch for consistency)
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related docs/kanban-architecture.md — optimistic update specification
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, MoveTaskInput, Task } from '@worknest/shared'

import { api, createLogger, taskKeys } from '@core/lib'

const log = createLogger('BOARD')

// ─── Types ─────────────────────────────────────────────────────

interface MoveTaskParams {
  taskId: string
  body: MoveTaskInput
}

// ─── Hook ──────────────────────────────────────────────────────

export function useMoveTask(slug: string, projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: ({ taskId, body }: MoveTaskParams) =>
      api.patch<ApiSuccessResponse<Task>>(
        `/api/workspaces/${slug}/tasks/${taskId}/move`,
        body,
      ),

    // ─── Optimistic Update ───────────────────────────────────

    onMutate: async ({ taskId, body }) => {
      log.debug('Optimistic move', { taskId, status: body.status, position: body.position })

      // Step 1: Cancel any ongoing refetches (prevent server overwriting our optimistic data)
      await queryClient.cancelQueries({ queryKey })

      // Step 2: Snapshot current cache for rollback
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)

      // Step 3: Optimistically update the cache
      queryClient.setQueryData<Task[]>(queryKey, (old) => {
        if (!old) return old
        return old.map((task) =>
          task.id === taskId
            ? { ...task, status: body.status, position: body.position }
            : task,
        )
      })

      // Return snapshot for rollback on error
      return { previousTasks }
    },

    // ─── Rollback on Error ───────────────────────────────────

    onError: (_error, _params, context) => {
      log.warn('Move failed, rolling back')

      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks)
      }

      toast.error('Failed to move task')
    },

    // ─── Background Refetch ──────────────────────────────────

    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      // to ensure cache is consistent with server state
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
