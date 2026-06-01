/**
 * @file DemoBoard.tsx — Live interactive kanban demo for the landing page
 * @module client/features/landing/components
 *
 * A self-contained, API-free demo of WorkNest's kanban board. Uses local
 * React state + dnd-kit for drag-and-drop. Lets visitors try the exact
 * same interaction they'd use in the real app — drag a card between
 * columns, feel the motion — without signing up.
 *
 * Reuses the real `TaskCard` component (pure, no hooks) so the demo
 * stays visually identical to production. The scaled-down 3-column
 * layout (Todo / In Progress / Done) keeps the demo compact enough
 * to fit below the hero CTAs without breaking desktop layout.
 *
 * @dependencies @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
 * @related client/src/features/task/components/TaskCard.tsx — reused card visual
 */

import { useCallback, useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { cn } from '@core/lib'
import { TaskCard } from '@features/task/components/TaskCard'
import type { Task, TaskStatus } from '@worknest/shared'

// ─── Mock Data ─────────────────────────────────────────────────

/** Mock tasks hint at the kind of work WorkNest is built to track. */
const INITIAL_TASKS: Task[] = [
  makeTask({ id: 't1',  number: 12, title: 'Design workspace switcher dropdown', status: 'todo',        priority: 'medium', pos: 1 }),
  makeTask({ id: 't2',  number: 14, title: 'Rate-limit invitation endpoint',     status: 'todo',        priority: 'high',   pos: 2 }),
  makeTask({ id: 't3',  number: 23, title: 'Set up CI with GitHub Actions',      status: 'todo',        priority: 'medium', pos: 3 }),
  makeTask({ id: 't4',  number: 25, title: 'Write README + contributing guide',  status: 'todo',        priority: 'low',    pos: 4 }),
  makeTask({ id: 't5',  number: 17, title: 'Ship drag-and-drop on kanban board', status: 'in_progress', priority: 'urgent', pos: 1 }),
  makeTask({ id: 't6',  number: 21, title: 'Add 6-digit OTP email auth',         status: 'in_progress', priority: 'high',   pos: 2 }),
  makeTask({ id: 't7',  number: 26, title: 'Refactor theme toggle to Zustand',   status: 'in_progress', priority: 'medium', pos: 3 }),
  makeTask({ id: 't8',  number: 4,  title: 'Bootstrap Drizzle schema migrations',status: 'done',        priority: 'medium', pos: 1 }),
  makeTask({ id: 't9',  number: 9,  title: 'Wire Supabase Row-Level Security',   status: 'done',        priority: 'high',   pos: 2 }),
  makeTask({ id: 't10', number: 3,  title: 'Set up monorepo + Vite + Tailwind',  status: 'done',        priority: 'medium', pos: 3 }),
]

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Todo' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

// ─── Types ─────────────────────────────────────────────────────

export type DemoRole = 'owner' | 'admin' | 'member' | 'viewer'

interface DemoBoardProps {
  /** Optional role — controls which interactions are enabled.
   *  Defaults to `owner` (full access) when unset. */
  role?: DemoRole
}

// ─── Board ─────────────────────────────────────────────────────

export function DemoBoard({ role = 'owner' }: DemoBoardProps = {}): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  // Viewers can only look — not drag.
  const isReadOnly = role === 'viewer'

  // One-time jiggle hint on the first Todo card so visitors see the
  // affordance even without moving their cursor. Fires ~1.5 s after
  // mount; the CSS class removes itself at animation-end.
  const [hintTaskId, setHintTaskId] = useState<string | null>(null)
  useEffect(() => {
    if (isReadOnly) return
    const firstTodo = INITIAL_TASKS.find((t) => t.status === 'todo')
    if (!firstTodo) return
    const showTimer = window.setTimeout(() => setHintTaskId(firstTodo.id), 1500)
    // Total jiggle duration is ~1.8s (0.9s × 2 iterations). Clear after
    // that so the class doesn't linger on the DOM.
    const clearTimer = window.setTimeout(() => setHintTaskId(null), 1500 + 1900)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(clearTimer)
    }
  }, [isReadOnly])

  // 8px activation distance — same as real board, prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    /* no-op — visual feedback is handled by useSortable isDragging */
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (isReadOnly) return
    const { active, over } = event
    if (!over) return

    setTasks((current) => {
      const activeTask = current.find((t) => t.id === active.id)
      if (!activeTask) return current

      // Determine target column: either a direct column drop or an adjacent task
      const overId = String(over.id)
      let targetStatus: TaskStatus
      if (overId.startsWith('column-')) {
        targetStatus = overId.replace('column-', '') as TaskStatus
      } else {
        const overTask = current.find((t) => t.id === over.id)
        targetStatus = overTask?.status ?? activeTask.status
      }

      // Compute insert index within the target column
      const targetColumn = current
        .filter((t) => t.status === targetStatus && t.id !== activeTask.id)
        .sort((a, b) => a.position - b.position)
      const overIndex = targetColumn.findIndex((t) => t.id === over.id)
      const insertIndex = overIndex === -1 ? targetColumn.length : overIndex

      const above = insertIndex > 0 ? targetColumn[insertIndex - 1]?.position : undefined
      const below = insertIndex < targetColumn.length ? targetColumn[insertIndex]?.position : undefined
      const newPosition = fractionalPosition(above, below)

      return current.map((t) =>
        t.id === activeTask.id ? { ...t, status: targetStatus, position: newPosition } : t,
      )
    })
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-center">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map(({ status, label }) => (
            <DemoColumn
              key={status}
              status={status}
              label={label}
              tasks={tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)}
              isReadOnly={isReadOnly}
              hintTaskId={hintTaskId}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

// ─── Column ────────────────────────────────────────────────────

interface DemoColumnProps {
  status: TaskStatus
  label: string
  tasks: Task[]
  isReadOnly?: boolean
  hintTaskId?: string | null
}

function DemoColumn({ status, label, tasks, isReadOnly, hintTaskId }: DemoColumnProps): JSX.Element {
  const { setNodeRef } = useDroppable({ id: `column-${status}`, data: { status } })

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-lg border border-border/60 bg-surface/40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </h3>
        <span className="text-xs text-text-dim">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 space-y-2 px-2 pb-3" style={{ minHeight: '100px' }}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              isReadOnly={isReadOnly}
              showHint={task.id === hintTaskId}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// ─── Sortable Card ─────────────────────────────────────────────

function SortableCard({
  task,
  isReadOnly,
  showHint,
}: {
  task: Task
  isReadOnly?: boolean
  showHint?: boolean
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task, status: task.status },
    disabled: isReadOnly,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isReadOnly ? {} : attributes)}
      {...(isReadOnly ? {} : listeners)}
      className={cn(
        'group relative',
        isReadOnly ? 'cursor-default' : 'touch-none',
        !isReadOnly && (isDragging ? 'cursor-grabbing opacity-40' : 'cursor-grab'),
        // One-time wiggle hint so visitors see the card is draggable
        showHint && !isDragging && 'animate-drag-hint',
      )}
    >
      <TaskCard task={task} projectKey="WN" isDragging={isDragging} />
      {/* Hover-revealed grip icon — a persistent affordance for visitors
          who didn't catch the jiggle hint */}
      {!isReadOnly && (
        <GripVertical
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim',
            'opacity-0 transition-opacity group-hover:opacity-60',
          )}
        />
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

/** Fractional indexing — same algorithm as the real board. */
function fractionalPosition(above?: number, below?: number): number {
  if (above === undefined && below === undefined) return 1
  if (above === undefined) return below! - 1
  if (below === undefined) return above! + 1
  return (above + below) / 2
}

/**
 * Builds a shape-compatible Task for the demo. Omitted fields are filled
 * with null / stub UUIDs so the type contract stays satisfied without
 * requiring a backend.
 */
function makeTask({
  id,
  number,
  title,
  status,
  priority,
  pos,
}: {
  id: string
  number: number
  title: string
  status: TaskStatus
  priority: Task['priority']
  pos: number
}): Task {
  return {
    id,
    workspace_id: 'demo-workspace',
    project_id: 'demo-project',
    title,
    description: null,
    task_number: number,
    status,
    priority,
    position: pos,
    assignee_id: null,
    created_by: 'demo-user',
    parent_id: null,
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
