/**
 * @file useUpdateComment.ts — Update comment mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for PATCH /api/workspaces/:slug/comments/:id.
 * Only the comment author can edit. Invalidates cache on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/comment/comment.routes.ts — PATCH /comments/:id
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, Comment, UpdateCommentInput } from '@worknest/shared'

import { api, commentKeys } from '@core/lib'

interface UpdateCommentParams {
  commentId: string
  body: UpdateCommentInput
}

export function useUpdateComment(slug: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, body }: UpdateCommentParams) =>
      api.patch<ApiSuccessResponse<Comment>>(
        `/api/workspaces/${slug}/comments/${commentId}`,
        body,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byTask(taskId),
      })
      toast.success('Comment updated')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update comment')
    },
  })
}
