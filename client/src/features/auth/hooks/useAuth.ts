/**
 * @file useAuth.ts — Authentication state synchronization hook
 * @module client/features/auth/hooks
 *
 * Listens to Supabase onAuthStateChange events and syncs the auth
 * state with the Zustand authStore. When a user signs in, it calls
 * the backend to ensure the user row exists, fetches the full profile,
 * and updates the store. When signed out, it triggers cleanup.
 *
 * Called once at the App level — not inside individual components.
 *
 * @dependencies @supabase/supabase-js, client/src/core/lib, client/src/core/stores
 * @related client/src/core/stores/authStore.ts — store this hook populates
 */

import { useEffect } from 'react'

import type { ApiSuccessResponse, User } from '@worknest/shared'

import { api, createLogger, supabase } from '@core/lib'
import { useAuthStore } from '@core/stores'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Hook ──────────────────────────────────────────────────────

/**
 * Subscribes to Supabase auth state changes and keeps the authStore
 * in sync. Must be called once in App.tsx — handles the full lifecycle:
 *
 *   SIGNED_IN  → ensure user exists in DB → fetch profile → setUser()
 *   SIGNED_OUT → cleanupOnSignOut()
 *   INITIAL_SESSION → same as SIGNED_IN (restores session on page refresh)
 */
export function useAuth(): void {
  const setUser = useAuthStore((s) => s.setUser)
  const reset = useAuthStore((s) => s.reset)

  useEffect(() => {
    // Check for existing session on mount (page refresh)
    const initializeAuth = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        log.info('Existing session found, fetching profile')
        await syncUserProfile(session.user.id, session.user.email ?? '', setUser)
      }
    }

    initializeAuth()

    // Listen for future auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.debug('Auth state changed', { event })

        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user.id, session.user.email ?? '', setUser)
        }

        if (event === 'SIGNED_OUT') {
          log.info('User signed out')
          reset()
        }
      },
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, reset])
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Ensures the user exists in the database and fetches their full profile.
 * Called on SIGNED_IN and INITIAL_SESSION events.
 */
async function syncUserProfile(
  userId: string,
  email: string,
  setUser: (user: User) => void,
): Promise<void> {
  try {
    // Ensure user row exists (safety net for the DB trigger)
    await api.post('/api/auth/callback', { userId, email })

    // Fetch the full profile
    const response = await api.get<ApiSuccessResponse<{ user: User }>>('/api/auth/me')
    setUser(response.data.user)

    log.info('User profile synced', { id: userId })
  } catch (error) {
    log.error('Failed to sync user profile', { error })
  }
}
