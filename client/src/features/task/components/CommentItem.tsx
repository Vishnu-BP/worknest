/**
 * @file CommentItem.tsx — Single comment in the discussion thread
 * @module client/features/task/components
 *
 * Displays a comment with author info, relative timestamp, markdown body,
 * and edit/delete actions (author-only for edit, author+admin for delete).
 * Markdown is rendered safely via react-markdown (strips raw HTML).
 *
 * @dependencies react-markdown, remark-gfm, lucide-react
 * @related client/src/features/task/components/TaskComments.tsx — renders these
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Edit2, Trash2 } from 'lucide-react'

import { Button } from '@core/components/ui/button'

import type { Comment } from '@worknest/shared'

// ─── Component ─────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment
  isAuthor: boolean
  canDelete: boolean
  onUpdate: (body: string) => void
  onDelete: () => void
}

export function CommentItem({
  comment,
  isAuthor,
  canDelete,
  onUpdate,
  onDelete,
}: CommentItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)

  const handleSave = (): void => {
    const trimmed = editBody.trim()
    if (trimmed && trimmed !== comment.body) {
      onUpdate(trimmed)
    }
    setIsEditing(false)
  }

  return (
    <div className="group rounded-md border border-border bg-surface p-3">
      {/* Header: author + time + actions */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-medium text-primary">
              {comment.author_id.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            {formatRelativeTime(comment.created_at)}
          </span>
          {comment.created_at !== comment.updated_at && (
            <span className="text-[10px] text-text-dim">(edited)</span>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAuthor && (
            <button
              onClick={() => { setEditBody(comment.body); setIsEditing(true) }}
              className="p-1 text-text-dim hover:text-text-muted"
              title="Edit"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-text-dim hover:text-error"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-primary text-white">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm prose-invert max-w-none text-sm text-text-muted">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {comment.body}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
