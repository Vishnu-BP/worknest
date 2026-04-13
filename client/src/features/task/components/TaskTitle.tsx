/**
 * @file TaskTitle.tsx — Inline editable task title
 * @module client/features/task/components
 *
 * Click to edit → input → Enter saves (optimistic), Esc cancels.
 * This is one of the three approved optimistic update operations
 * per CLAUDE.md (drag-drop, column reorder, inline title edits).
 *
 * @dependencies react
 * @related client/src/features/task/components/TaskDetailModal.tsx — renders this
 */

import { useState, useRef, useEffect } from 'react'

import { cn } from '@core/lib'

// ─── Component ─────────────────────────────────────────────────

interface TaskTitleProps {
  title: string
  projectKey: string
  taskNumber: number
  onSave: (newTitle: string) => void
}

export function TaskTitle({ title, projectKey, taskNumber, onSave }: TaskTitleProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = (): void => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== title) {
      onSave(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setEditValue(title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div>
      {/* Task number */}
      <p className="mb-1 text-xs font-medium text-text-dim">
        {projectKey}-{taskNumber}
      </p>

      {/* Editable title */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full rounded border border-primary bg-background px-2 py-1',
            'text-lg font-semibold text-text outline-none',
          )}
        />
      ) : (
        <h2
          onClick={() => { setEditValue(title); setIsEditing(true) }}
          className="cursor-pointer rounded px-2 py-1 text-lg font-semibold text-text hover:bg-surface-alt"
          title="Click to edit"
        >
          {title}
        </h2>
      )}
    </div>
  )
}
