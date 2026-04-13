/**
 * @file useCreateComment.ts — Create comment mutation
 * @module client/features/task/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/tasks/:taskId/comments.
 * Invalidates the comment list cache on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/comment/comment.routes.ts — POST /comments
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, Comment, CreateCommentInput } from '@worknest/shared'

import { api, commentKeys } from '@core/lib'

export function useCreateComment(slug: string, taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      api.post<ApiSuccessResponse<Comment>>(
        `/api/workspaces/${slug}/tasks/${taskId}/comments`,
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byTask(taskId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to post comment')
    },
  })
}
