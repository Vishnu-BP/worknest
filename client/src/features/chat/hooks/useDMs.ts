/**
 * @file useDMs.ts — List current user's DM channels for a workspace
 * @module client/features/chat/hooks
 *
 * GET /api/workspaces/:slug/dms
 *
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, DMChannel } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useDMs(slug: string | undefined) {
  return useQuery({
    queryKey: chatKeys.dms(slug ?? ''),
    queryFn: async () => {
      const res = await api.get<ApiSuccessResponse<DMChannel[]>>(
        `/api/workspaces/${slug}/dms`,
      )
      return res.data
    },
    staleTime: STALE_TIMES.MEDIUM,
    enabled: !!slug,
  })
}
