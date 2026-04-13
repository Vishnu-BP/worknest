/**
 * @file authStore.ts — Zustand store for authentication state
 * @module client/core/stores
 *
 * Manages the current user's identity and authentication status.
 * Populated by the useAuth hook when Supabase fires onAuthStateChange.
 * Reset by cleanupOnSignOut() during sign-out.
 *
 * Rules (per CLAUDE.md):
 *   - Selective subscriptions only: useAuthStore((s) => s.currentUser)
 *   - Never useAuthStore() without a selector
 *   - Outside React: useAuthStore.getState().currentUser
 *   - Must have reset() action for sign-out cleanup
 *
 * @dependencies zustand
 * @related client/src/features/auth/hooks/useAuth.ts — populates this store
 * @related client/src/core/lib/cleanup.ts — calls reset() on sign-out
 */

import { create } from 'zustand'

import type { User } from '@worknest/shared'

// ─── Types ─────────────────────────────────────────────────────

interface AuthState {
  /** The authenticated user's profile, or null if not logged in */
  currentUser: User | null
  /** Convenience boolean derived from currentUser presence */
  isAuthenticated: boolean
}

interface AuthActions {
  /** Set the current user after successful authentication */
  setUser: (user: User) => void
  /** Clear all auth state — called during sign-out cleanup */
  reset: () => void
}

// ─── Initial State ─────────────────────────────────────────────

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
}

// ─── Store ─────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      currentUser: user,
      isAuthenticated: true,
    }),

  reset: () => set(initialState),
}))
