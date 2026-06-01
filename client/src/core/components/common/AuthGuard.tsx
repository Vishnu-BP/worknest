/**
 * @file AuthGuard.tsx — Protected route wrapper
 * @module client/core/components/common
 *
 * Wraps protected routes in React Router. Reads auth state from the
 * Zustand store (single source of truth, owned by useAuth):
 *   - isAuthLoading: true  → render a spinner (session still being resolved)
 *   - isAuthenticated: false → redirect to /auth, preserving the target URL
 *   - else → render children
 *
 * This component does NOT call supabase.auth.getSession() itself —
 * useAuth owns that, which removes the race condition where AuthGuard
 * could redirect a logged-in user before the store was populated.
 *
 * @dependencies react-router-dom, client/src/core/stores
 * @related client/src/features/auth/hooks/useAuth.ts — populates the store
 */

import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@core/config'
import { useAuthStore } from '@core/stores'

// ─── Component ─────────────────────────────────────────────────

export function AuthGuard({ children }: { children: React.ReactNode }): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading)
  const location = useLocation()

  // ─── Resolving Session → Spinner ───────────────────────────

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  // ─── Not Authenticated → Redirect to Auth ──────────────────

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after sign-in
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />
  }

  // ─── Authenticated → Render Protected Content ──────────────

  return <>{children}</>
}
