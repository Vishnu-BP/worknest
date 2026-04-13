/**
 * @file WorkspaceLayout.tsx — Main authenticated layout with sidebar + header
 * @module client/core/components/common
 *
 * Wraps all workspace child routes (/w/:slug/*). The sidebar and header
 * persist across navigation — only the <Outlet /> content area swaps
 * when the user navigates between dashboard, members, settings, etc.
 *
 * Also updates the lastWorkspaceSlug in localStorage whenever the
 * workspace slug changes (for redirect on next login).
 *
 * @dependencies react-router-dom
 * @related client/src/App.tsx — mounts this at /w/:slug
 */

import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { LAST_WORKSPACE_KEY } from '@core/config'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

// ─── Component ─────────────────────────────────────────────────

export function WorkspaceLayout(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()

  // Persist last visited workspace for redirect on next login
  useEffect(() => {
    if (slug) {
      localStorage.setItem(LAST_WORKSPACE_KEY, slug)
    }
  }, [slug])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — fixed left */}
      <Sidebar />

      {/* Main content area — fills remaining width */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
