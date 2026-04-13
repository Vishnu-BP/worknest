/**
 * @file queryClient.ts — TanStack Query client configuration
 * @module client/core/lib
 *
 * Creates and exports the QueryClient with default settings for
 * stale time, retry behavior, and error handling. All TanStack Query
 * hooks throughout the app share this single client instance.
 *
 * @dependencies @tanstack/react-query
 * @related client/src/main.tsx — wraps the app with QueryClientProvider
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered "fresh" before background refetch
      staleTime: 30_000, // 30 seconds (overridden per-hook where needed)
      // Don't retry on auth errors (401/403) — those won't resolve with retries
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status === 401 || status === 403) return false
        }
        return failureCount < 3
      },
      // Refetch on window focus for fresh data when user returns to tab
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Don't retry mutations — they may have side effects
      retry: false,
    },
  },
})
