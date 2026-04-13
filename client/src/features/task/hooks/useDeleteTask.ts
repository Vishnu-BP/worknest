/**
 * @file useDeleteTask.ts — Delete task mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/tasks/:taskId.
 * Invalidates the task list cache on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/task/task.routes.ts — DELETE /tasks/:taskId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, taskKeys } from '@core/lib'

export function useDeleteTask(slug: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) =>
      api.delete(`/api/workspaces/${slug}/tasks/${taskId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(projectId),
      })
      toast.success('Task deleted')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })
}
