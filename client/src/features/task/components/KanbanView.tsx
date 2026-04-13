/**
 * @file KanbanView.tsx — Main Kanban board with drag-and-drop
 * @module client/features/task/components
 *
 * The core board component. Wraps 6 status columns in a DndContext
 * that handles drag-and-drop interactions. Tasks are fetched via
 * useTasks, grouped by status, filtered client-side via filterStore,
 * and sorted by position within each column.
 *
 * Drag lifecycle:
 *   onDragStart → record active task, show DragOverlay
 *   onDragEnd   → calculate new position (fractional indexing),
 *                  fire optimistic move mutation
 *   onDragCancel → clear active task
 *
 * Position calculation uses the fractional indexing algorithm:
 *   empty column = 1.0, top = below - 1.0, bottom = above + 1.0,
 *   between = (above + below) / 2
 *
 * @dependencies @dnd-kit/core, @dnd-kit/sortable
 * @related docs/kanban-architecture.md — full specification
 */

import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
  closestCorners,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

import { TASK_STATUS_ORDER } from '@worknest/shared'
import type { Project, Task, TaskStatus } from '@worknest/shared'

import { createLogger } from '@core/lib'
import { Skeleton } from '@core/components/ui/skeleton'
import { useFilterStore } from '@core/stores'

import { useTasks } from '../hooks/useTasks'
import { useMoveTask } from '../hooks/useMoveTask'
import { KanbanColumn } from './KanbanColumn'
import { KanbanDragOverlay } from './KanbanDragOverlay'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('BOARD')

// ─── Component ─────────────────────────────────────────────────

interface KanbanViewProps {
  project: Project
  slug: string
  onTaskClick?: (taskId: string) => void
}

export function KanbanView({ project, slug, onTaskClick }: KanbanViewProps): JSX.Element {
  const { data: tasks, isLoading } = useTasks(slug, project.id)
  const moveTask = useMoveTask(slug, project.id)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // ─── Filters (client-side, no API call) ────────────────────

  const statusFilter = useFilterStore((s) => s.statusFilter)
  const priorityFilter = useFilterStore((s) => s.priorityFilter)
  const assigneeFilter = useFilterStore((s) => s.assigneeFilter)

  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    return tasks.filter((task) => {
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) return false
      if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) return false
      if (assigneeFilter && task.assignee_id !== assigneeFilter) return false
      return true
    })
  }, [tasks, statusFilter, priorityFilter, assigneeFilter])

  // ─── Group tasks by status column ──────────────────────────

  const columnData = useMemo(() =>
    TASK_STATUS_ORDER.map((status) => ({
      status,
      tasks: filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position),
    })),
    [filteredTasks],
  )

  // ─── dnd-kit Sensors ───────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts (prevents accidental drags on click)
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  // ─── Drag Handlers ─────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.['task'] as Task | undefined
    if (task) {
      setActiveTask(task)
      log.debug('Drag started', { taskId: task.id })
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over || !tasks) return

    const activeTaskData = active.data.current?.['task'] as Task | undefined
    if (!activeTaskData) return

    // Determine target status — either from the column droppable or another task's data
    let targetStatus: TaskStatus
    if (over.id.toString().startsWith('column-')) {
      targetStatus = over.id.toString().replace('column-', '') as TaskStatus
    } else {
      const overTask = over.data.current?.['task'] as Task | undefined
      targetStatus = overTask?.status ?? activeTaskData.status
    }

    // Get tasks in the target column (from current cache, not filtered)
    const targetColumnTasks = tasks
      .filter((t) => t.status === targetStatus && t.id !== activeTaskData.id)
      .sort((a, b) => a.position - b.position)

    // Calculate insert index based on the over item
    let insertIndex = targetColumnTasks.length // default: bottom

    if (!over.id.toString().startsWith('column-')) {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === over.id)
      if (overIndex !== -1) {
        insertIndex = overIndex
      }
    }

    // Calculate fractional position
    const above = insertIndex > 0 ? targetColumnTasks[insertIndex - 1]?.position : undefined
    const below = insertIndex < targetColumnTasks.length ? targetColumnTasks[insertIndex]?.position : undefined
    const newPosition = calculatePosition(above, below)

    // Skip if nothing changed
    if (activeTaskData.status === targetStatus && activeTaskData.position === newPosition) {
      return
    }

    log.info('Moving task', {
      taskId: activeTaskData.id,
      from: activeTaskData.status,
      to: targetStatus,
      position: newPosition,
    })

    moveTask.mutate({
      taskId: activeTaskData.id,
      body: { status: targetStatus, position: newPosition },
    })
  }, [tasks, moveTask])

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
  }, [])

  // ─── Loading State ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUS_ORDER.map((status) => (
          <div key={status} className="w-72 shrink-0 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // ─── Board ─────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnData.map(({ status, tasks: columnTasks }) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columnTasks}
            projectKey={project.key}
            slug={slug}
            projectId={project.id}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <KanbanDragOverlay activeTask={activeTask} projectKey={project.key} />
    </DndContext>
  )
}

// ─── Position Calculation ──────────────────────────────────────

/**
 * Calculates fractional position for a task being inserted between
 * two neighbors. Same algorithm as server/src/core/utils/position.ts.
 */
function calculatePosition(above?: number, below?: number): number {
  if (above === undefined && below === undefined) return 1.0
  if (above === undefined) return below! - 1.0
  if (below === undefined) return above! + 1.0
  return (above + below) / 2
}
