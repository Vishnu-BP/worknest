/**
 * @file KanbanDragOverlay.tsx — Floating card clone during drag
 * @module client/features/task/components
 *
 * Renders a styled clone of the dragged task card that follows the
 * cursor. Uses dnd-kit's DragOverlay component which portals the
 * content above all other elements. Only visible during an active drag.
 *
 * @dependencies @dnd-kit/core
 * @related client/src/features/task/components/KanbanView.tsx — manages activeTask state
 */

import { DragOverlay } from '@dnd-kit/core'

import type { Task } from '@worknest/shared'

import { TaskCard } from './TaskCard'

// ─── Component ─────────────────────────────────────────────────

interface KanbanDragOverlayProps {
  activeTask: Task | null
  projectKey: string
}

export function KanbanDragOverlay({
  activeTask,
  projectKey,
}: KanbanDragOverlayProps): JSX.Element {
  return (
    <DragOverlay dropAnimation={null}>
      {activeTask ? (
        <div className="w-72 rotate-2 shadow-xl">
          <TaskCard
            task={activeTask}
            projectKey={projectKey}
            isDragging
          />
        </div>
      ) : null}
    </DragOverlay>
  )
}
