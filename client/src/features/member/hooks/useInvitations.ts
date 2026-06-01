/**
 * @file useInvitations.ts — Fetch pending invitations for a workspace
 * @module client/features/member/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/invitations.
 * Returns non-expired pending invitations (owner/admin only).
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/invitation/invitation.routes.ts — GET /invitations
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, Invitation } from '@worknest/shared'

import { api, invitationKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useInvitations(slug: string | undefined) {
  return useQuery({
    queryKey: invitationKeys.byWorkspace(slug ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<Invitation[]>>(
        `/api/workspaces/${slug}/invitations`,
      ),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug,
  })
}
