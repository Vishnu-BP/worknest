/**
 * @file useRemoveLabel.ts — Remove label from task mutation
 * @module client/features/label/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/tasks/:taskId/labels/:labelId.
 * Invalidates the task list cache so label dots update on the card.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/task-label/taskLabel.routes.ts — DELETE /labels/:labelId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, taskKeys } from '@core/lib'

export function useRemoveLabel(slug: string, taskId: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (labelId: string) =>
      api.delete(`/api/workspaces/${slug}/tasks/${taskId}/labels/${labelId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(projectId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to remove label')
    },
  })
}
