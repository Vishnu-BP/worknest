/**
 * @file ProjectBoard.tsx — Project board page (Kanban board + task detail)
 * @module client/features/project/pages
 *
 * Route: /w/:slug/projects/:projectId/board
 * Fetches the project and labels, renders the board with filter toggle,
 * and manages the task detail modal via URL search params (?task=id).
 *
 * Clicking a TaskCard on the board sets ?task=<id> in the URL.
 * This component reads the param and opens the TaskDetailModal.
 * Closing the modal removes the param.
 *
 * @dependencies react-router-dom
 * @related client/src/features/task/ — task components and hooks
 */

import { useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { Skeleton } from '@core/components/ui/skeleton'
import { useAuthStore } from '@core/stores'

import { useProject } from '../hooks/useProject'
import {
  KanbanView,
  BoardHeader,
  BoardFilters,
  TaskDetailModal,
} from '@features/task'
import { useLabels, useAddLabel, useRemoveLabel } from '@features/label'
import { useMembers } from '@features/member'

// ─── Component ─────────────────────────────────────────────────

export function ProjectBoard(): JSX.Element {
  const { slug, projectId } = useParams<{ slug: string; projectId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: project, isLoading } = useProject(slug, projectId)
  const { data: labels } = useLabels(slug)
  const { data: members } = useMembers(slug)
  const currentUser = useAuthStore((s) => s.currentUser)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // ─── Task Detail Modal (URL-synced) ────────────────────────

  const selectedTaskId = searchParams.get('task')

  const openTaskDetail = useCallback((taskId: string) => {
    setSearchParams({ task: taskId })
  }, [setSearchParams])

  const closeTaskDetail = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  // Find current user's role in workspace
  const currentMember = members?.find((m) => m.user_id === currentUser?.id)
  const userRole = currentMember?.role ?? 'viewer'

  // Label management for the selected task (hooks need stable params)
  const addLabel = useAddLabel(slug!, selectedTaskId ?? '', projectId!)
  const removeLabel = useRemoveLabel(slug!, selectedTaskId ?? '', projectId!)

  // TODO: Get applied label IDs for the selected task
  // This will be properly implemented when task detail includes labels
  const appliedLabelIds: string[] = []

  // ─── Loading ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return <p className="text-text-muted">Project not found.</p>
  }

  // ─── Board ─────────────────────────────────────────────────

  return (
    <div>
      <BoardHeader
        project={project}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
      />

      {isFiltersOpen && <BoardFilters />}

      <KanbanView
        project={project}
        slug={slug!}
        onTaskClick={openTaskDetail}
      />

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          onClose={closeTaskDetail}
          taskId={selectedTaskId}
          slug={slug!}
          projectId={projectId!}
          projectKey={project.key}
          labels={labels ?? []}
          appliedLabelIds={appliedLabelIds}
          userRole={userRole}
          onAddLabel={(labelId) => addLabel.mutate(labelId)}
          onRemoveLabel={(labelId) => removeLabel.mutate(labelId)}
        />
      )}
    </div>
  )
}
