/**
 * @file ProjectLayout.tsx — Project-scoped layout with Board / Chat tabs
 * @module client/features/project/components
 *
 * Renders a horizontal tab strip above an <Outlet />. The Board and Chat
 * tabs are sibling routes nested under /w/:slug/projects/:projectId/.
 * Active tab is derived from the current pathname so deep links into the
 * chat (e.g. /chat/<channelId>) keep "Chat" highlighted.
 *
 * @related client/src/App.tsx — registers this as the project route element
 */

import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { LayoutGrid, MessageSquare } from 'lucide-react'

import { ROUTES } from '@core/config'
import { cn } from '@core/lib'

import { useProject } from '../hooks/useProject'

export function ProjectLayout(): JSX.Element {
  const { slug, projectId } = useParams<{ slug: string; projectId: string }>()
  const location = useLocation()
  const { data: project } = useProject(slug, projectId)

  const tabs = useMemo(
    () => [
      {
        label: 'Board',
        icon: LayoutGrid,
        to: ROUTES.PROJECT_BOARD(slug ?? '', projectId ?? ''),
        match: 'board',
      },
      {
        label: 'Chat',
        icon: MessageSquare,
        to: ROUTES.PROJECT_CHAT(slug ?? '', projectId ?? ''),
        match: 'chat',
      },
    ],
    [slug, projectId],
  )

  const activeTab = location.pathname.includes('/chat') ? 'chat' : 'board'

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 border-b border-border">
        {project && (
          <div className="flex items-center gap-2 pb-2 pr-4">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-text">{project.name}</span>
            <span className="text-xs text-text-dim">({project.key})</span>
          </div>
        )}

        <nav className="flex gap-1">
          {tabs.map(({ label, icon: Icon, to, match }) => {
            const isActive = activeTab === match
            return (
              <NavLink
                key={match}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'border-primary text-text'
                    : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  )
}
