/**
 * @file cleanup.ts — Centralized sign-out cleanup
 * @module client/core/lib
 *
 * Called when a user signs out (button click or forced by 401).
 * Resets ALL application state to prevent stale data from leaking
 * between sessions. Must be updated whenever a new Zustand store
 * is added to the application.
 *
 * Cleanup order:
 *   1. Reset all Zustand stores
 *   2. Unsubscribe from all Supabase Realtime channels
 *   3. Clear TanStack Query cache
 *   4. Sign out from Supabase (clears tokens)
 *   5. Redirect to login
 *
 * @dependencies client/src/core/stores, client/src/core/lib/queryClient
 * @related CLAUDE.md — "Sign-Out Cleanup" section
 */

import { ROUTES } from '../config/routes'
import { queryClient } from './queryClient'
import { supabase } from './supabase'

export async function cleanupOnSignOut(): Promise<void> {
  // 1. Reset all Zustand stores
  // Import dynamically to avoid circular dependencies
  const { useAuthStore } = await import('../stores/authStore')
  const { useUIStore } = await import('../stores/uiStore')
  const { useFilterStore } = await import('../stores/filterStore')
  useAuthStore.getState().reset()
  useUIStore.getState().reset()
  useFilterStore.getState().reset()

  // 2. Unsubscribe from all Supabase Realtime channels
  const channels = supabase.getChannels()
  for (const channel of channels) {
    await supabase.removeChannel(channel)
  }

  // 3. Clear all cached server data
  queryClient.clear()

  // 4. Sign out from Supabase (clears access + refresh tokens)
  await supabase.auth.signOut()

  // 5. Redirect to the auth page
  window.location.href = ROUTES.AUTH
}
