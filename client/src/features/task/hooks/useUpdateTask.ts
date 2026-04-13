/**
 * @file useUpdateTask.ts — Update task fields mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for PATCH /api/workspaces/:slug/tasks/:taskId.
 * Updates task fields (title, description, priority, assignee, due date).
 * Does NOT handle status/position changes — use useMoveTask for that.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/task/task.routes.ts — PATCH /tasks/:taskId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, Task, UpdateTaskInput } from '@worknest/shared'

import { api, taskKeys } from '@core/lib'

interface UpdateTaskParams {
  taskId: string
  body: UpdateTaskInput
}

export function useUpdateTask(slug: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, body }: UpdateTaskParams) =>
      api.patch<ApiSuccessResponse<Task>>(
        `/api/workspaces/${slug}/tasks/${taskId}`,
        body,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(projectId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update task')
    },
  })
}
