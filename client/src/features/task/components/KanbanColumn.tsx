/**
 * @file KanbanColumn.tsx — Single Kanban board column (one per status)
 * @module client/features/task/components
 *
 * Renders a vertical column for one task status: header (status name,
 * count, color dot), a SortableContext wrapping the task cards, and
 * TaskQuickCreate at the bottom. Each task card is wrapped with
 * useSortable for drag-and-drop.
 *
 * The SortableContext enables dnd-kit to track item order within
 * the column and detect cross-column drag targets.
 *
 * @dependencies @dnd-kit/sortable, @dnd-kit/utilities
 * @related client/src/features/task/components/KanbanView.tsx — parent
 */

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'

import { cn } from '@core/lib'

import type { Task, TaskStatus } from '@worknest/shared'

import { getStatusLabel, StatusBadge } from './StatusBadge'
import { TaskCard } from './TaskCard'
import { TaskQuickCreate } from './TaskQuickCreate'

// ─── Types ─────────────────────────────────────────────────────

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  projectKey: string
  slug: string
  projectId: string
  onTaskClick?: (taskId: string) => void
}

// ─── Column Component ──────────────────────────────────────────

export function KanbanColumn({
  status,
  tasks,
  projectKey,
  slug,
  projectId,
  onTaskClick,
}: KanbanColumnProps): JSX.Element {
  const taskIds = tasks.map((t) => t.id)

  // Make the column a drop target even when empty
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${status}`,
    data: { status },
  })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-background">
      {/* ─── Column Header ──────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-3">
        <StatusBadge status={status} size="md" showTooltip={false} />
        <h3 className="text-sm font-semibold text-text">
          {getStatusLabel(status)}
        </h3>
        <span className="text-xs text-text-dim">{tasks.length}</span>
      </div>

      {/* ─── Task List (Sortable) ───────────────────── */}
      <div
        ref={setDroppableRef}
        className="flex-1 space-y-2 overflow-y-auto px-2 pb-2"
        style={{ minHeight: '80px' }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              projectKey={projectKey}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>

      {/* ─── Quick Create ───────────────────────────── */}
      <div className="px-2 pb-2">
        <TaskQuickCreate slug={slug} projectId={projectId} status={status} />
      </div>
    </div>
  )
}

// ─── Sortable Task Card Wrapper ────────────────────────────────

/**
 * Wraps TaskCard with useSortable to make it draggable.
 * Separated from TaskCard itself to keep the card component
 * lightweight and hook-free (per CLAUDE.md — composition pattern).
 */
function SortableTaskCard({
  task,
  projectKey,
  onTaskClick,
}: {
  task: Task
  projectKey: string
  onTaskClick?: (taskId: string) => void
}): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task, status: task.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Click opens detail modal (only if not dragging)
  const handleClick = (): void => {
    if (!isDragging && onTaskClick) {
      onTaskClick(task.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(isDragging && 'opacity-40', 'cursor-pointer')}
    >
      <TaskCard task={task} projectKey={projectKey} isDragging={isDragging} />
    </div>
  )
}
