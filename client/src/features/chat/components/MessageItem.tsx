/**
 * @file MessageItem.tsx — Single chat message row
 * @module client/features/chat/components
 *
 * Renders avatar + author name + timestamp + body. Author can edit/delete
 * via hover actions; admins can also delete anyone's message. Edit mode
 * swaps the body for a textarea with Save/Cancel.
 *
 * @related client/src/features/chat/components/MessageList.tsx
 */

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'

import { Button } from '@core/components/ui/button'

import type { MessageWithAuthor } from '@worknest/shared'

interface MessageItemProps {
  message: MessageWithAuthor
  isAuthor: boolean
  canDelete: boolean
  onUpdate: (body: string) => void
  onDelete: () => void
}

export function MessageItem({
  message,
  isAuthor,
  canDelete,
  onUpdate,
  onDelete,
}: MessageItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(message.body)

  const handleSave = (): void => {
    const trimmed = editBody.trim()
    if (trimmed && trimmed !== message.body) {
      onUpdate(trimmed)
    }
    setIsEditing(false)
  }

  const displayName = message.author.full_name ?? message.author.email
  const initials = (message.author.full_name ?? message.author.email)
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="group flex gap-3 px-4 py-2 hover:bg-surface/50">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
        {message.author.avatar_url ? (
          <img
            src={message.author.avatar_url}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium text-primary">{initials}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text">{displayName}</span>
          <span className="text-xs text-text-dim">{formatTime(message.created_at)}</span>
          {message.edited_at && (
            <span className="text-[10px] text-text-dim">(edited)</span>
          )}

          <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {isAuthor && !isEditing && (
              <button
                type="button"
                onClick={() => { setEditBody(message.body); setIsEditing(true) }}
                className="p-1 text-text-dim hover:text-text-muted"
                title="Edit"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
            {canDelete && !isEditing && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1 text-text-dim hover:text-error"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={2}
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
          <p className="whitespace-pre-wrap break-words text-sm text-text-muted">
            {message.body}
          </p>
        )}
      </div>
    </div>
  )
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
