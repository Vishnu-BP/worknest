/**
 * @file InvitationList.tsx — Pending invitations table
 * @module client/features/member/components
 *
 * Displays pending workspace invitations with email, role, sent time,
 * expiry, and a revoke button. Owner/admin only (enforced by backend,
 * hidden in UI via currentUserRole check).
 *
 * @dependencies lucide-react, shadcn/ui
 * @related client/src/features/member/pages/Members.tsx — renders this
 */

import { Clock, X } from 'lucide-react'

import { Button } from '@core/components/ui/button'

import type { Invitation } from '@worknest/shared'

import { RoleBadge } from './RoleBadge'

// ─── Component ─────────────────────────────────────────────────

interface InvitationListProps {
  invitations: Invitation[]
  onRevoke: (invitationId: string) => void
}

export function InvitationList({ invitations, onRevoke }: InvitationListProps): JSX.Element {
  if (invitations.length === 0) {
    return <p className="text-xs text-text-dim">No pending invitations</p>
  }

  return (
    <div className="space-y-2">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3"
        >
          {/* Email */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {invitation.email}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="h-3 w-3 text-text-dim" />
              <span className="text-[10px] text-text-dim">
                Expires {formatExpiry(invitation.expires_at)}
              </span>
            </div>
          </div>

          {/* Role */}
          <RoleBadge role={invitation.role} />

          {/* Revoke */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(invitation.id)}
            className="h-8 w-8 p-0 text-text-dim hover:text-error"
            title="Revoke invitation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function formatExpiry(isoStr: string): string {
  const diff = new Date(isoStr).getTime() - Date.now()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours <= 0) return 'soon'
  if (hours < 24) return `in ${hours}h`
  const days = Math.floor(hours / 24)
  return `in ${days}d`
}
