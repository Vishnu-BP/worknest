/**
 * @file AuthGuard.tsx — Protected route wrapper
 * @module client/core/components/common
 *
 * Wraps protected routes in React Router. Checks for a valid Supabase
 * session on mount — if authenticated, renders children. If not,
 * redirects to the login page. Shows a loading state while the
 * session check is in progress to prevent flash of login page.
 *
 * @dependencies react, react-router-dom, @supabase/supabase-js
 * @related client/src/App.tsx — wraps protected route group with this
 */

import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@core/config'
import { supabase } from '@core/lib'
import { useAuthStore } from '@core/stores'

// ─── Component ─────────────────────────────────────────────────

export function AuthGuard({ children }: { children: React.ReactNode }): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession()

      // If no Supabase session and store says not authenticated, we're done
      if (!session && !isAuthenticated) {
        setIsLoading(false)
        return
      }

      // Session exists — useAuth hook will sync the store
      // Give it a moment to populate before rendering
      setIsLoading(false)
    }

    checkSession()
  }, [isAuthenticated])

  // ─── Loading State ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  // ─── Not Authenticated → Redirect to Login ─────────────────

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // ─── Authenticated → Render Protected Content ──────────────

  return <>{children}</>
}
