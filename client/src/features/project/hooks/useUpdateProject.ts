/**
 * @file useUpdateProject.ts — Update project mutation
 * @module client/features/project/hooks
 *
 * TanStack Query mutation for PATCH /api/workspaces/:slug/projects/:projectId.
 * Invalidates both list and detail caches on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/project/project.routes.ts — PATCH /projects/:projectId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, Project, UpdateProjectInput } from '@worknest/shared'

import { api, projectKeys } from '@core/lib'

export function useUpdateProject(slug: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      api.patch<ApiSuccessResponse<Project>>(
        `/api/workspaces/${slug}/projects/${projectId}`,
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.byWorkspace(slug),
      })
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      })
      toast.success('Project updated')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
}
