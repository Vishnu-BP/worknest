/**
 * @file TaskProperties.tsx — Task property selectors in detail modal
 * @module client/features/task/components
 *
 * Displays and allows editing of: status, priority, assignee, due date,
 * and labels. Each property is a row with a label and a control.
 * Changes fire mutations immediately (no "Save" button).
 *
 * @dependencies @worknest/shared, lucide-react
 * @related client/src/features/task/components/TaskDetailModal.tsx — renders this
 */

import { Calendar, CircleDot, Flag, Tag } from 'lucide-react'

import { TASK_STATUS_ORDER, PRIORITY_ORDER } from '@worknest/shared'
import type { Label, Priority, Task, TaskStatus } from '@worknest/shared'

import { getStatusLabel } from './StatusBadge'

// ─── Component ─────────────────────────────────────────────────

interface TaskPropertiesProps {
  task: Task
  labels: Label[]
  appliedLabelIds: string[]
  onUpdateStatus: (status: TaskStatus) => void
  onUpdatePriority: (priority: Priority) => void
  onUpdateAssignee: (assigneeId: string | null) => void
  onUpdateDueDate: (dueDate: string | null) => void
  onAddLabel: (labelId: string) => void
  onRemoveLabel: (labelId: string) => void
}

export function TaskProperties({
  task,
  labels,
  appliedLabelIds,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignee: _onUpdateAssignee,
  onUpdateDueDate,
  onAddLabel,
  onRemoveLabel,
}: TaskPropertiesProps): JSX.Element {
  return (
    <div className="space-y-3">
      {/* Status */}
      <PropertyRow icon={CircleDot} label="Status">
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(e.target.value as TaskStatus)}
          className="rounded border border-border bg-background px-2 py-1 text-xs text-text"
        >
          {TASK_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </PropertyRow>

      {/* Priority */}
      <PropertyRow icon={Flag} label="Priority">
        <select
          value={task.priority}
          onChange={(e) => onUpdatePriority(e.target.value as Priority)}
          className="rounded border border-border bg-background px-2 py-1 text-xs text-text capitalize"
        >
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </PropertyRow>

      {/* Due Date */}
      <PropertyRow icon={Calendar} label="Due date">
        <input
          type="date"
          value={task.due_date ?? ''}
          onChange={(e) => onUpdateDueDate(e.target.value || null)}
          className="rounded border border-border bg-background px-2 py-1 text-xs text-text"
        />
      </PropertyRow>

      {/* Labels */}
      <PropertyRow icon={Tag} label="Labels">
        <div className="flex flex-wrap gap-1">
          {labels
            .filter((l) => appliedLabelIds.includes(l.id))
            .map((l) => (
              <button
                key={l.id}
                onClick={() => onRemoveLabel(l.id)}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium hover:opacity-70"
                style={{
                  backgroundColor: `${l.color}20`,
                  color: l.color,
                  border: `1px solid ${l.color}40`,
                }}
                title={`Remove ${l.name}`}
              >
                {l.name} ×
              </button>
            ))}
          {/* Add label button */}
          {labels
            .filter((l) => !appliedLabelIds.includes(l.id))
            .slice(0, 3)
            .map((l) => (
              <button
                key={l.id}
                onClick={() => onAddLabel(l.id)}
                className="inline-flex items-center rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-text-dim hover:text-text-muted"
              >
                + {l.name}
              </button>
            ))}
        </div>
      </PropertyRow>
    </div>
  )
}

// ─── Property Row Layout ───────────────────────────────────────

function PropertyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 items-center gap-2 text-xs text-text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
