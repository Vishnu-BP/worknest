/**
 * @file useMembers.ts — Fetch workspace members with user profiles
 * @module client/features/member/hooks
 *
 * TanStack Query wrapper for GET /api/workspaces/:slug/members.
 * Returns MemberWithUser[] for the members page and role management.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/member/member.routes.ts — GET /members
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, MemberWithUser } from '@worknest/shared'

import { api, memberKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useMembers(slug: string | undefined) {
  return useQuery({
    queryKey: memberKeys.byWorkspace(slug ?? ''),
    queryFn: () =>
      api.get<ApiSuccessResponse<MemberWithUser[]>>(
        `/api/workspaces/${slug}/members`,
      ),
    staleTime: STALE_TIMES.LONG,
    select: (response) => response.data,
    enabled: !!slug,
  })
}
