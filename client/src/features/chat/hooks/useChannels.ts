/**
 * @file useChannels.ts — List project channels
 * @module client/features/chat/hooks
 *
 * GET /api/workspaces/:slug/projects/:projectId/channels
 *
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 */

import { useQuery } from '@tanstack/react-query'

import type { ApiSuccessResponse, ChatChannel } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'
import { STALE_TIMES } from '@core/config'

export function useChannels(slug: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.channelsByProject(projectId ?? ''),
    queryFn: async () => {
      const res = await api.get<ApiSuccessResponse<ChatChannel[]>>(
        `/api/workspaces/${slug}/projects/${projectId}/channels`,
      )
      return res.data
    },
    staleTime: STALE_TIMES.MEDIUM,
    enabled: !!slug && !!projectId,
  })
}
