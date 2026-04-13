/**
 * @file useCreateWorkspace.ts — Create workspace mutation
 * @module client/features/workspace/hooks
 *
 * TanStack Query mutation for POST /api/workspaces. Creates a new
 * workspace and the requesting user as the owner. On success,
 * invalidates the workspace list cache and navigates to the new
 * workspace. Updates lastWorkspaceSlug in localStorage.
 *
 * @dependencies @tanstack/react-query, react-router-dom, client/src/core/lib
 * @related server/src/modules/workspace/workspace.routes.ts — POST /workspaces
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateWorkspaceInput, MemberWithUser, Workspace } from '@worknest/shared'

import { api, workspaceKeys } from '@core/lib'
import { LAST_WORKSPACE_KEY, ROUTES } from '@core/config'

interface CreateWorkspaceResponse {
  workspace: Workspace
  member: MemberWithUser
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) =>
      api.post<ApiSuccessResponse<CreateWorkspaceResponse>>('/api/workspaces', input),

    onSuccess: (response) => {
      const { workspace } = response.data

      // Update cache
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })

      // Persist last workspace for redirect on next login
      localStorage.setItem(LAST_WORKSPACE_KEY, workspace.slug)

      // Navigate to the new workspace
      navigate(ROUTES.WORKSPACE(workspace.slug))

      toast.success(`Workspace "${workspace.name}" created`)
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create workspace')
    },
  })
}
