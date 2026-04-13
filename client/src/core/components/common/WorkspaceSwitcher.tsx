/**
 * @file WorkspaceSwitcher.tsx — Workspace selection dropdown
 * @module client/core/components/common
 *
 * Dropdown at the top of the sidebar showing all user's workspaces.
 * Current workspace is highlighted. Selecting another navigates to it.
 * "Create workspace" option opens the creation dialog.
 *
 * @dependencies shadcn/ui, react-router-dom, client/src/features/workspace
 * @related client/src/core/components/common/Sidebar.tsx — renders this
 */

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@core/components/ui/dropdown-menu'
import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { LAST_WORKSPACE_KEY, ROUTES } from '@core/config'
import { useUIStore } from '@core/stores'

import { useWorkspaces } from '@features/workspace/hooks/useWorkspaces'

export function WorkspaceSwitcher(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const openModal = useUIStore((s) => s.openModal)
  const { data: workspaces, isLoading } = useWorkspaces()

  const currentWorkspace = workspaces?.find((w) => w.slug === slug)

  const handleSwitch = (workspaceSlug: string): void => {
    localStorage.setItem(LAST_WORKSPACE_KEY, workspaceSlug)
    navigate(ROUTES.WORKSPACE(workspaceSlug))
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between border border-border px-3 text-left text-sm font-medium text-text hover:bg-surface-alt"
        >
          <span className="truncate">
            {currentWorkspace?.name ?? 'Select workspace'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-text-muted" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 border-border bg-surface" align="start">
        {workspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            className="cursor-pointer focus:bg-surface-alt focus:text-text"
            onClick={() => handleSwitch(workspace.slug)}
          >
            <span className="flex-1 truncate text-text">{workspace.name}</span>
            {workspace.slug === slug && (
              <Check className="ml-2 h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          className="cursor-pointer text-text-muted focus:bg-surface-alt focus:text-text"
          onClick={() => openModal('createWorkspace')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
