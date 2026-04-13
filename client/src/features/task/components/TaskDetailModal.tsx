/**
 * @file TaskDetailModal.tsx — Task detail slide-over panel
 * @module client/features/task/components
 *
 * Sheet (slide-over from right) showing full task details:
 *   1. Editable title (inline, optimistic)
 *   2. Properties panel (status, priority, assignee, due date, labels)
 *   3. Description (markdown)
 *   4. Comments thread
 *   5. Activity feed
 *
 * Opened by clicking a TaskCard on the board. URL syncs with
 * ?task=<id> search param for shareable links.
 *
 * @dependencies shadcn/ui, react-router-dom
 * @related client/src/features/project/pages/ProjectBoard.tsx — controls open state
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from '@core/components/ui/sheet'
import { Separator } from '@core/components/ui/separator'
import { Skeleton } from '@core/components/ui/skeleton'

import type { Label, Role } from '@worknest/shared'

import { useTasks } from '../hooks/useTasks'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { useMoveTask } from '../hooks/useMoveTask'
import { TaskTitle } from './TaskTitle'
import { TaskProperties } from './TaskProperties'
import { TaskComments } from './TaskComments'
import { TaskActivity } from './TaskActivity'

// ─── Component ─────────────────────────────────────────────────

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  slug: string
  projectId: string
  projectKey: string
  labels: Label[]
  appliedLabelIds: string[]
  userRole: Role
  onAddLabel: (labelId: string) => void
  onRemoveLabel: (labelId: string) => void
}

export function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  slug,
  projectId,
  projectKey,
  labels,
  appliedLabelIds,
  userRole,
  onAddLabel,
  onRemoveLabel,
}: TaskDetailModalProps): JSX.Element {
  const { data: tasks } = useTasks(slug, projectId)
  const updateTask = useUpdateTask(slug, projectId)
  const moveTask = useMoveTask(slug, projectId)

  const task = tasks?.find((t) => t.id === taskId)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full border-border bg-background sm:max-w-lg overflow-y-auto"
      >
        {!task ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6 pb-8">
            {/* ─── Header: Title ────────────────────────── */}
            <SheetHeader className="text-left">
              <TaskTitle
                title={task.title}
                projectKey={projectKey}
                taskNumber={task.task_number}
                onSave={(newTitle) =>
                  updateTask.mutate({ taskId: task.id, body: { title: newTitle } })
                }
              />
            </SheetHeader>

            <Separator className="bg-border" />

            {/* ─── Properties ───────────────────────────── */}
            <TaskProperties
              task={task}
              labels={labels}
              appliedLabelIds={appliedLabelIds}
              onUpdateStatus={(status) =>
                moveTask.mutate({
                  taskId: task.id,
                  body: { status, position: task.position },
                })
              }
              onUpdatePriority={(priority) =>
                updateTask.mutate({ taskId: task.id, body: { priority } })
              }
              onUpdateAssignee={(assigneeId) =>
                updateTask.mutate({ taskId: task.id, body: { assignee_id: assigneeId } })
              }
              onUpdateDueDate={(dueDate) =>
                updateTask.mutate({ taskId: task.id, body: { due_date: dueDate } })
              }
              onAddLabel={onAddLabel}
              onRemoveLabel={onRemoveLabel}
            />

            {/* ─── Description ──────────────────────────── */}
            {task.description && (
              <>
                <Separator className="bg-border" />
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-text">Description</h3>
                  <p className="text-sm text-text-muted whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              </>
            )}

            <Separator className="bg-border" />

            {/* ─── Comments ─────────────────────────────── */}
            <TaskComments slug={slug} taskId={taskId} userRole={userRole} />

            <Separator className="bg-border" />

            {/* ─── Activity ─────────────────────────────── */}
            <TaskActivity activities={[]} isLoading={false} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
