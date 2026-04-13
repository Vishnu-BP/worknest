/**
 * @file EmptyState.tsx — Reusable empty state placeholder
 * @module client/core/components/common
 *
 * Displayed when a list has no items (no workspaces, no projects, etc.).
 * Accepts an icon, title, description, and optional CTA button.
 *
 * @dependencies lucide-react
 * @related client/src/features/workspace/pages/WorkspaceDashboard.tsx
 */

import type { LucideIcon } from 'lucide-react'

import { Button } from '@core/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-alt p-4">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-primary text-white hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
