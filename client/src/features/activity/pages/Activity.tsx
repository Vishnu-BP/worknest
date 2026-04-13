/**
 * @file Activity.tsx — Workspace activity feed page
 * @module client/features/activity/pages
 *
 * Route: /w/:slug/activity
 * Full workspace activity feed with pagination and entity type filter.
 * Shows all actions across all projects, tasks, members, etc.
 *
 * @dependencies react-router-dom, lucide-react
 * @related server/src/modules/activity/activity.routes.ts — GET /activity
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Activity as ActivityIcon } from 'lucide-react'

import type { EntityType } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { cn } from '@core/lib'

import { useActivity } from '../hooks/useActivity'

// ─── Action Labels ─────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  task_created: 'created a task',
  task_updated: 'updated a task',
  task_moved: 'moved a task',
  task_deleted: 'deleted a task',
  comment_added: 'added a comment',
  comment_updated: 'edited a comment',
  comment_deleted: 'deleted a comment',
  member_invited: 'invited a member',
  member_joined: 'joined the workspace',
  member_removed: 'removed a member',
  project_created: 'created a project',
  project_updated: 'updated a project',
  project_archived: 'archived a project',
  workspace_created: 'created the workspace',
  workspace_updated: 'updated the workspace',
}

// ─── Entity Type Filter Labels ─────────────────────────────────

const ENTITY_FILTERS: { value: EntityType; label: string }[] = [
  { value: 'task', label: 'Tasks' },
  { value: 'project', label: 'Projects' },
  { value: 'comment', label: 'Comments' },
  { value: 'member', label: 'Members' },
  { value: 'workspace', label: 'Workspace' },
]

// ─── Component ─────────────────────────────────────────────────

export function Activity(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState(1)
  const [entityFilter, setEntityFilter] = useState<EntityType | undefined>(undefined)

  const { data, isLoading } = useActivity(slug, page, entityFilter)

  const activities = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Activity</h2>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => { setEntityFilter(undefined); setPage(1) }}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            !entityFilter
              ? 'bg-primary text-white'
              : 'bg-surface-alt text-text-muted hover:text-text',
          )}
        >
          All
        </button>
        {ENTITY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setEntityFilter(f.value); setPage(1) }}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              entityFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-muted hover:text-text',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ActivityIcon className="mb-4 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-md border border-border bg-surface p-3"
            >
              {/* Actor avatar */}
              <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-medium text-primary">
                  {(entry.actor?.full_name ?? entry.actor?.email ?? '?')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-text">
                    {entry.actor?.full_name || entry.actor?.email}
                  </span>{' '}
                  <span className="text-text-muted">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </p>

                {/* Metadata */}
                <MetadataLine action={entry.action} metadata={entry.metadata} />

                <p className="mt-1 text-[10px] text-text-dim">
                  {formatTime(entry.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-text-muted">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Metadata Display ──────────────────────────────────────────

function MetadataLine({ action, metadata }: { action: string; metadata: Record<string, unknown> }): JSX.Element | null {
  if (action === 'task_moved' && metadata['from_status']) {
    return (
      <p className="mt-0.5 text-xs text-text-dim">
        {String(metadata['from_status'])} → {String(metadata['to_status'])}
      </p>
    )
  }
  if (metadata['title']) {
    return (
      <p className="mt-0.5 text-xs text-text-dim truncate">
        &quot;{String(metadata['title'])}&quot;
      </p>
    )
  }
  return null
}

// ─── Helpers ───────────────────────────────────────────────────

function formatTime(isoStr: string): string {
  const date = new Date(isoStr)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
