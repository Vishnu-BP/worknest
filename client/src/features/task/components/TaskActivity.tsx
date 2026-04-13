/**
 * @file TaskActivity.tsx — Task-scoped activity feed
 * @module client/features/task/components
 *
 * Displays activity log entries related to a specific task
 * (task_created, task_updated, task_moved, comment_added, etc.)
 * within the task detail modal. Fetched from the workspace
 * activity endpoint filtered by entity_id.
 *
 * @dependencies lucide-react
 * @related client/src/features/task/components/TaskDetailModal.tsx — renders this
 */

import { Activity } from 'lucide-react'

import type { ActivityAction } from '@worknest/shared'

// ─── Action Labels ─────────────────────────────────────────────

const ACTION_LABELS: Partial<Record<ActivityAction, string>> = {
  task_created: 'created this task',
  task_updated: 'updated this task',
  task_moved: 'moved this task',
  task_deleted: 'deleted this task',
  comment_added: 'added a comment',
  comment_updated: 'edited a comment',
  comment_deleted: 'deleted a comment',
}

// ─── Component ─────────────────────────────────────────────────

interface ActivityEntry {
  id: string
  action: ActivityAction
  metadata: Record<string, unknown>
  created_at: string
  actor?: { email: string; full_name: string | null }
}

interface TaskActivityProps {
  activities: ActivityEntry[]
  isLoading?: boolean
}

export function TaskActivity({ activities, isLoading }: TaskActivityProps): JSX.Element {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
        <Activity className="h-4 w-4" />
        Activity
      </h3>

      {isLoading ? (
        <p className="text-xs text-text-dim">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="text-xs text-text-dim">No activity yet.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((entry) => {
            const actionText = ACTION_LABELS[entry.action] ?? entry.action
            const metadata = entry.metadata

            return (
              <div key={entry.id} className="flex items-start gap-2 text-xs">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-dim" />
                <div className="flex-1">
                  <span className="font-medium text-text-muted">
                    {entry.actor?.full_name || entry.actor?.email || 'Someone'}
                  </span>{' '}
                  <span className="text-text-dim">{actionText}</span>
                  {/* Show metadata context for moves */}
                  {entry.action === 'task_moved' && 'from_status' in metadata && (
                    <span className="text-text-dim">
                      {' '}from {String(metadata['from_status'])} to {String(metadata['to_status'])}
                    </span>
                  )}
                  <span className="ml-2 text-text-dim">
                    {formatRelativeTime(entry.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
