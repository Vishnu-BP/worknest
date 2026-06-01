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
 *   INITIAL_SESSION → first event on mount. Carries the session that
 *                     Supabase resolved from localStorage OR from the
 *                     URL hash on an OAuth redirect. Treated the same
 *                     as SIGNED_IN.
 *   SIGNED_IN       → explicit sign-in within the same page life (OTP
 *                     verify, OAuth callback). Ensure user row → fetch
 *                     profile → setUser().
 *   SIGNED_OUT      → reset().
 *   TOKEN_REFRESHED → SDK silently rotated the access token. No store
 *                     change needed (user stays authed, profile is
 *                     already loaded).
 *
 * The imperative `getSession()` path was removed because it returned
 * before Supabase finished parsing the OAuth URL hash, racing against
 * the listener and flipping `isAuthLoading` to false while the user
 * was actually authed — AuthGuard then bounced them to /auth.
 * Relying solely on the listener guarantees `isAuthLoading` only
 * clears after the session is truly resolved.
 */
export function useAuth(): void {
  const setUser = useAuthStore((s) => s.setUser)
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading)
  const reset = useAuthStore((s) => s.reset)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.debug('Auth state changed', { event })

        if (
          (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
          session?.user
        ) {
          try {
            await syncUserProfile(
              session.user.id,
              session.user.email ?? '',
              setUser,
            )
          } catch (error) {
            log.error('Failed to sync user profile', { error })
          }
        }

        if (event === 'SIGNED_OUT') {
          log.info('User signed out')
          reset()
        }

        // Release AuthGuard's hold only after the first event has been
        // fully processed — by this point the store reflects the
        // resolved session (or confirmed lack thereof).
        setAuthLoading(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setAuthLoading, reset])
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
