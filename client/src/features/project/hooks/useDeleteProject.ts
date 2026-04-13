/**
 * @file useDeleteProject.ts — Delete project mutation
 * @module client/features/project/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/projects/:projectId.
 * Invalidates the project list cache and navigates back to the workspace
 * dashboard on success.
 *
 * @dependencies @tanstack/react-query, sonner, react-router-dom, client/src/core/lib
 * @related server/src/modules/project/project.routes.ts — DELETE /projects/:projectId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { api, projectKeys } from '@core/lib'
import { ROUTES } from '@core/config'

export function useDeleteProject(slug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (projectId: string) =>
      api.delete(`/api/workspaces/${slug}/projects/${projectId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.byWorkspace(slug),
      })
      navigate(ROUTES.WORKSPACE(slug))
      toast.success('Project deleted')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })
}
