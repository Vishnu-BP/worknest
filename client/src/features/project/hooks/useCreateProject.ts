/**
 * @file useCreateProject.ts — Create project mutation
 * @module client/features/project/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/projects.
 * On success, invalidates the project list cache and shows a toast.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/project/project.routes.ts — POST /projects
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateProjectInput, Project } from '@worknest/shared'

import { api, projectKeys } from '@core/lib'
import { ROUTES } from '@core/config'

export function useCreateProject(slug: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api.post<ApiSuccessResponse<Project>>(
        `/api/workspaces/${slug}/projects`,
        input,
      ),

    onSuccess: (response) => {
      const project = response.data

      queryClient.invalidateQueries({
        queryKey: projectKeys.byWorkspace(slug),
      })

      navigate(ROUTES.PROJECT_BOARD(slug, project.id))
      toast.success(`Project "${project.name}" created`)
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })
}
