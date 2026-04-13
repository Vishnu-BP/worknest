/**
 * @file useAddLabel.ts — Add label to task mutation
 * @module client/features/label/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/tasks/:taskId/labels.
 * Invalidates the task list cache so label dots update on the card.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/task-label/taskLabel.routes.ts — POST /labels
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, taskKeys } from '@core/lib'

export function useAddLabel(slug: string, taskId: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (labelId: string) =>
      api.post(`/api/workspaces/${slug}/tasks/${taskId}/labels`, { labelId }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(projectId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to add label')
    },
  })
}
