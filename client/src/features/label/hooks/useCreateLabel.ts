/**
 * @file useCreateLabel.ts — Create label mutation
 * @module client/features/label/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/labels.
 * Invalidates the label list cache on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/label/label.routes.ts — POST /labels
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateLabelInput, Label } from '@worknest/shared'

import { api, labelKeys } from '@core/lib'

export function useCreateLabel(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLabelInput) =>
      api.post<ApiSuccessResponse<Label>>(
        `/api/workspaces/${slug}/labels`,
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.byWorkspace(slug),
      })
      toast.success('Label created')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create label')
    },
  })
}
