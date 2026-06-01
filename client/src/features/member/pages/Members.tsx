/**
 * @file Members.tsx — Workspace members + invitations smart page
 * @module client/features/member/pages
 *
 * Smart page showing: member list with role management, plus pending
 * invitations with invite dialog for owner/admin users.
 *
 * @dependencies react-router-dom, shadcn/ui
 * @related client/src/features/member/components/MemberList.tsx
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Mail, Users } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@core/components/ui/dialog'
import { Separator } from '@core/components/ui/separator'
import { useAuthStore } from '@core/stores'
import { EmptyState } from '@core/components/common/EmptyState'

import type { Role } from '@worknest/shared'

import { useMembers } from '../hooks/useMembers'
import { useUpdateMemberRole } from '../hooks/useUpdateMemberRole'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { useInvitations } from '../hooks/useInvitations'
import { useRevokeInvitation } from '../hooks/useRevokeInvitation'
import { MemberList } from '../components/MemberList'
import { InvitationList } from '../components/InvitationList'
import { InviteDialog } from '../components/InviteDialog'

// ─── Component ─────────────────────────────────────────────────

export function Members(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: members, isLoading } = useMembers(slug)
  const { data: invitations } = useInvitations(slug)
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const revokeInvitation = useRevokeInvitation(slug ?? '')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const currentMember = members?.find((m) => m.user_id === currentUser?.id)
  const currentUserRole: Role = currentMember?.role ?? 'viewer'
  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin'

  // ─── Handlers ──────────────────────────────────────────────

  const handleUpdateRole = (memberId: string, newRole: Role): void => {
    if (!slug) return
    updateRole.mutate({ slug, memberId, role: newRole })
  }

  const handleRemove = (memberId: string): void => {
    if (!slug) return
    removeMember.mutate({ slug, memberId })
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Members</h2>
        {canInvite && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="gap-2 bg-primary text-white hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" />
            Invite member
          </Button>
        )}
      </div>

      {/* Member List */}
      {!isLoading && members?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No members"
          description="This workspace has no members yet."
        />
      )}

      <MemberList
        members={members ?? []}
        currentUserRole={currentUserRole}
        currentUserId={currentUser?.id ?? ''}
        onUpdateRole={handleUpdateRole}
        onRemove={handleRemove}
        isLoading={isLoading}
      />

      {/* Pending Invitations */}
      {canInvite && invitations && invitations.length > 0 && (
        <>
          <Separator className="my-8 bg-border" />
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text">
              Pending Invitations ({invitations.length})
            </h3>
            <InvitationList
              invitations={invitations}
              onRevoke={(id) => revokeInvitation.mutate(id)}
            />
          </div>
        </>
      )}

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text">Invite member</DialogTitle>
          </DialogHeader>
          <InviteDialog
            slug={slug ?? ''}
            onSuccess={() => setIsInviteOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
