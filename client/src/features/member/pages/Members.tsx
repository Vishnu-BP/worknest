/**
 * @file Members.tsx — Workspace members smart page
 * @module client/features/member/pages
 *
 * Smart page that fetches workspace members and renders the MemberList
 * component. Connects the mutation hooks (updateRole, removeMember)
 * to the dumb MemberList's callback props.
 *
 * @dependencies react-router-dom
 * @related client/src/features/member/components/MemberList.tsx
 */

import { useParams } from 'react-router-dom'
import { Users } from 'lucide-react'

import { useAuthStore } from '@core/stores'
import { EmptyState } from '@core/components/common/EmptyState'

import type { Role } from '@worknest/shared'

import { useMembers } from '../hooks/useMembers'
import { useUpdateMemberRole } from '../hooks/useUpdateMemberRole'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { MemberList } from '../components/MemberList'

// ─── Component ─────────────────────────────────────────────────

export function Members(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: members, isLoading } = useMembers(slug)
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()

  // Find current user's role in this workspace
  const currentMember = members?.find((m) => m.user_id === currentUser?.id)
  const currentUserRole: Role = currentMember?.role ?? 'viewer'

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Members</h2>
        {/* Invite button added in Phase 11 */}
      </div>

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
    </div>
  )
}
