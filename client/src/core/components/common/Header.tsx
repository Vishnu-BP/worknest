/**
 * @file Header.tsx — Top header bar with breadcrumb and user menu
 * @module client/core/components/common
 *
 * Displays the current workspace name and page context as a breadcrumb.
 * User avatar with dropdown menu on the right. Persists across all
 * workspace child routes via WorkspaceLayout's Outlet pattern.
 *
 * @dependencies react-router-dom, client/src/features/workspace
 * @related client/src/core/components/common/WorkspaceLayout.tsx
 */

import { useLocation, useParams } from 'react-router-dom'

import { useWorkspace } from '@features/workspace/hooks/useWorkspace'

import { UserMenu } from './UserMenu'

// ─── Component ─────────────────────────────────────────────────

export function Header(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const { data: workspace } = useWorkspace(slug)

  // Derive current page name from URL path
  const pageName = getPageName(location.pathname, slug)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      {/* ─── Breadcrumb ──────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-text">
          {workspace?.name ?? 'Loading...'}
        </span>
        {pageName && (
          <>
            <span className="text-text-dim">/</span>
            <span className="text-text-muted">{pageName}</span>
          </>
        )}
      </div>

      {/* ─── Right Actions ───────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Command palette trigger will go here (Phase 11) */}
        <UserMenu />
      </div>
    </header>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

/** Extracts the current page name from the URL for the breadcrumb */
function getPageName(pathname: string, slug: string | undefined): string | null {
  if (!slug) return null

  const workspacePath = `/w/${slug}`
  const subPath = pathname.replace(workspacePath, '').replace(/^\//, '')

  if (!subPath || subPath === '') return null

  const pageMap: Record<string, string> = {
    members: 'Members',
    settings: 'Settings',
    activity: 'Activity',
  }

  return pageMap[subPath] ?? subPath
}
