/**
 * @file Settings.tsx — Workspace settings smart page
 * @module client/features/workspace/pages
 *
 * Smart page that fetches the current workspace and renders the
 * WorkspaceSettings component. Shows skeleton while loading.
 *
 * @dependencies react-router-dom
 * @related client/src/features/workspace/components/WorkspaceSettings.tsx
 */

import { useParams } from 'react-router-dom'

import { Skeleton } from '@core/components/ui/skeleton'

import { useWorkspace } from '../hooks/useWorkspace'
import { WorkspaceSettings } from '../components/WorkspaceSettings'

// ─── Component ─────────────────────────────────────────────────

export function Settings(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const { data: workspace, isLoading } = useWorkspace(slug)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  if (!workspace) {
    return <p className="text-text-muted">Workspace not found.</p>
  }

  return <WorkspaceSettings workspace={workspace} />
}
