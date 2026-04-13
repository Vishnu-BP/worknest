/**
 * @file TaskComments.tsx — Comment thread + compose form
 * @module client/features/task/components
 *
 * Displays the list of comments on a task (newest first, paginated)
 * and a compose form at the bottom. Supports markdown in comments
 * rendered safely via react-markdown.
 *
 * @dependencies react, sonner
 * @related client/src/features/task/components/CommentItem.tsx — individual comment
 */

import { useState } from 'react'

import { Button } from '@core/components/ui/button'
import { useAuthStore } from '@core/stores'

import type { Comment, Role } from '@worknest/shared'

import { useComments } from '../hooks/useComments'
import { useCreateComment } from '../hooks/useCreateComment'
import { useUpdateComment } from '../hooks/useUpdateComment'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { CommentItem } from './CommentItem'

// ─── Component ─────────────────────────────────────────────────

interface TaskCommentsProps {
  slug: string
  taskId: string
  userRole: Role
}

export function TaskComments({ slug, taskId, userRole }: TaskCommentsProps): JSX.Element {
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: commentData, isLoading } = useComments(slug, taskId)
  const createComment = useCreateComment(slug, taskId)
  const updateComment = useUpdateComment(slug, taskId)
  const deleteComment = useDeleteComment(slug, taskId)
  const [newBody, setNewBody] = useState('')

  const comments = commentData?.data ?? []
  const canDeleteAny = userRole === 'owner' || userRole === 'admin'

  const handlePost = async (): Promise<void> => {
    const trimmed = newBody.trim()
    if (!trimmed) return
    await createComment.mutateAsync({ body: trimmed })
    setNewBody('')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text">
        Comments {comments.length > 0 && `(${commentData?.pagination?.total ?? comments.length})`}
      </h3>

      {/* Comment List */}
      {isLoading ? (
        <p className="text-xs text-text-dim">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-dim">No comments yet. Start the discussion.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((comment: Comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthor={comment.author_id === currentUser?.id}
              canDelete={comment.author_id === currentUser?.id || canDeleteAny}
              onUpdate={(body) => updateComment.mutate({ commentId: comment.id, body: { body } })}
              onDelete={() => deleteComment.mutate(comment.id)}
            />
          ))}
        </div>
      )}

      {/* Compose Form */}
      <div className="space-y-2">
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Write a comment... (Markdown supported)"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-dim outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handlePost}
            disabled={!newBody.trim() || createComment.isPending}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {createComment.isPending ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
