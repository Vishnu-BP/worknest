/**
 * @file useCreateTask.ts — Create task mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/projects/:projectId/tasks.
 * Invalidates the task list cache on success. Used by TaskQuickCreate.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/task/task.routes.ts — POST /tasks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateTaskInput, Task } from '@worknest/shared'

import { api, taskKeys } from '@core/lib'

export function useCreateTask(slug: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      api.post<ApiSuccessResponse<Task>>(
        `/api/workspaces/${slug}/projects/${projectId}/tasks`,
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byProject(projectId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create task')
    },
  })
}
