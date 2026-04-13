/**
 * @file LabelSelector.tsx — Label multi-select popover
 * @module client/features/label/components
 *
 * Popover showing all workspace labels as checkboxes. Clicking a
 * label toggles it on/off the task (calls useAddLabel/useRemoveLabel).
 * Used in the TaskProperties panel inside TaskDetailModal.
 *
 * Receives applied label IDs as props (data flows from parent page).
 *
 * @dependencies shadcn/ui, lucide-react
 * @related client/src/features/task/components/TaskProperties.tsx — renders this
 */

import { useState } from 'react'
import { Check, Plus, Tag } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { cn } from '@core/lib'

import type { Label } from '@worknest/shared'

// ─── Component ─────────────────────────────────────────────────

interface LabelSelectorProps {
  /** All labels available in the workspace */
  labels: Label[]
  /** IDs of labels currently applied to this task */
  appliedLabelIds: string[]
  /** Called when user clicks a label to add it */
  onAdd: (labelId: string) => void
  /** Called when user clicks a label to remove it */
  onRemove: (labelId: string) => void
  /** Called to create a new label inline */
  onCreate?: (name: string) => void
  isLoading?: boolean
}

export function LabelSelector({
  labels,
  appliedLabelIds,
  onAdd,
  onRemove,
  onCreate,
  isLoading,
}: LabelSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newLabelName, setNewLabelName] = useState('')

  const filteredLabels = labels.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleToggle = (label: Label): void => {
    if (appliedLabelIds.includes(label.id)) {
      onRemove(label.id)
    } else {
      onAdd(label.id)
    }
  }

  const handleCreate = (): void => {
    const trimmed = newLabelName.trim()
    if (!trimmed || !onCreate) return
    onCreate(trimmed)
    setNewLabelName('')
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs text-text-muted hover:text-text"
        disabled={isLoading}
      >
        <Tag className="h-3.5 w-3.5" />
        {appliedLabelIds.length > 0 ? `${appliedLabelIds.length} labels` : 'Add labels'}
      </Button>
    )
  }

  return (
    <div className="w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search labels..."
        className="mb-2 h-8 border-border bg-background text-xs text-text"
        autoFocus
      />

      {/* Label List */}
      <div className="max-h-40 overflow-y-auto space-y-0.5">
        {filteredLabels.map((label) => {
          const isApplied = appliedLabelIds.includes(label.id)
          return (
            <button
              key={label.id}
              onClick={() => handleToggle(label)}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors',
                'hover:bg-surface-alt',
              )}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1 text-left text-text">{label.name}</span>
              {isApplied && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          )
        })}

        {filteredLabels.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-text-dim">No labels found</p>
        )}
      </div>

      {/* Create New Label */}
      {onCreate && (
        <div className="mt-2 flex gap-1 border-t border-border pt-2">
          <Input
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New label..."
            className="h-7 flex-1 border-border bg-background text-xs text-text"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCreate}
            disabled={!newLabelName.trim()}
            className="h-7 px-2"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Close */}
      <button
        onClick={() => { setIsOpen(false); setSearch('') }}
        className="mt-2 w-full text-center text-[10px] text-text-dim hover:text-text-muted"
      >
        Close
      </button>
    </div>
  )
}
