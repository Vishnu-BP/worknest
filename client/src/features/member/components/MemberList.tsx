/**
 * @file MemberList.tsx — Workspace member table with role management
 * @module client/features/member/components
 *
 * Displays all workspace members with their avatar, name, email, role badge,
 * and action dropdown (change role, remove). Actions are only shown to
 * users with owner/admin role. Owner row is protected — no actions available.
 *
 * This is a dumb component — receives data via props. The smart Members
 * page fetches the data and passes it here.
 *
 * @dependencies shadcn/ui, lucide-react
 * @related client/src/features/member/pages/Members.tsx — renders this
 */

import { MoreHorizontal } from 'lucide-react'

import type { MemberWithUser, Role } from '@worknest/shared'
import { ROLE } from '@worknest/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/avatar'
import { Button } from '@core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@core/components/ui/dropdown-menu'
import { Skeleton } from '@core/components/ui/skeleton'

import { RoleBadge } from './RoleBadge'

// ─── Types ─────────────────────────────────────────────────────

interface MemberListProps {
  members: MemberWithUser[]
  currentUserRole: Role
  currentUserId: string
  onUpdateRole: (memberId: string, newRole: Role) => void
  onRemove: (memberId: string) => void
  isLoading?: boolean
}

// ─── Component ─────────────────────────────────────────────────

export function MemberList({
  members,
  currentUserRole,
  currentUserId,
  onUpdateRole,
  onRemove,
  isLoading,
}: MemberListProps): JSX.Element {
  const canManageMembers =
    currentUserRole === ROLE.OWNER || currentUserRole === ROLE.ADMIN

  // ─── Loading Skeleton ──────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  // ─── Member Rows ───────────────────────────────────────────

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isOwner = member.role === ROLE.OWNER
        const isSelf = member.user_id === currentUserId

        const initials = member.user.full_name
          ? member.user.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : member.user.email.charAt(0).toUpperCase()

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.user.avatar_url ?? undefined} />
              <AvatarFallback className="bg-surface-alt text-sm text-text-muted">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name + Email */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-text">
                {member.user.full_name || member.user.email}
                {isSelf && (
                  <span className="ml-2 text-xs text-text-dim">(you)</span>
                )}
              </p>
              <p className="truncate text-xs text-text-muted">
                {member.user.email}
              </p>
            </div>

            {/* Role Badge */}
            <RoleBadge role={member.role} />

            {/* Actions (owner/admin only, not on owner row) */}
            {canManageMembers && !isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-text-muted hover:text-text"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="border-border bg-surface">
                  {/* Role change options */}
                  {Object.values(ROLE)
                    .filter((r) => r !== ROLE.OWNER && r !== member.role)
                    .map((role) => (
                      <DropdownMenuItem
                        key={role}
                        className="cursor-pointer capitalize focus:bg-surface-alt focus:text-text"
                        onClick={() => onUpdateRole(member.id, role)}
                      >
                        Change to {role}
                      </DropdownMenuItem>
                    ))}

                  <DropdownMenuSeparator className="bg-border" />

                  {/* Remove */}
                  <DropdownMenuItem
                    className="cursor-pointer text-error focus:bg-error/10 focus:text-error"
                    onClick={() => onRemove(member.id)}
                  >
                    Remove from workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      })}
    </div>
  )
}
