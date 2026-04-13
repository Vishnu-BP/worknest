/**
 * @file RoleBadge.tsx — Color-coded role badge
 * @module client/features/member/components
 *
 * Displays a workspace member's role as a colored pill. Each role
 * has a distinct color for quick visual identification in member lists.
 *
 * @dependencies shadcn/ui
 * @related client/src/features/member/components/MemberList.tsx
 */

import { Badge } from '@core/components/ui/badge'
import { cn } from '@core/lib'

import type { Role } from '@worknest/shared'

// ─── Role Colors ───────────────────────────────────────────────

const ROLE_STYLES: Record<Role, string> = {
  owner: 'bg-primary/15 text-primary border-primary/30',
  admin: 'bg-secondary/15 text-secondary border-secondary/30',
  member: 'bg-info/15 text-info border-info/30',
  viewer: 'bg-text-dim/15 text-text-dim border-text-dim/30',
}

// ─── Component ─────────────────────────────────────────────────

interface RoleBadgeProps {
  role: Role
}

export function RoleBadge({ role }: RoleBadgeProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium capitalize', ROLE_STYLES[role])}
    >
      {role}
    </Badge>
  )
}
