/**
 * @file useDeleteComment.ts — Delete comment mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/comments/:id.
 * Author or admin/owner can delete. Invalidates cache on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/comment/comment.routes.ts — DELETE /comments/:id
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, commentKeys } from '@core/lib'

export function useDeleteComment(slug: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/api/workspaces/${slug}/comments/${commentId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byTask(taskId),
      })
      toast.success('Comment deleted')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment')
    },
  })
}
