/**
 * @file InviteAccept.tsx — Invitation acceptance public page
 * @module client/features/invitation/pages
 *
 * Route: /invite-accept?token=xyz
 *
 * Flow:
 *   1. Read token from URL search params
 *   2. If not authenticated → redirect to /auth?invite=token
 *   3. If authenticated → POST /api/invitations/accept with token
 *   4. On success → redirect to home (which finds the new workspace)
 *   5. On error → show error message with "Go Home" button
 *
 * @dependencies react-router-dom
 * @related server/src/modules/invitation/invitation.routes.ts — POST /invitations/accept
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@core/components/ui/button'
import { Card, CardContent } from '@core/components/ui/card'
import { Skeleton } from '@core/components/ui/skeleton'
import { ROUTES } from '@core/config'
import { useAuthStore } from '@core/stores'

import { useAcceptInvitation } from '@features/member'

// ─── Component ─────────────────────────────────────────────────

export function InviteAccept(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const acceptInvitation = useAcceptInvitation()
  const [error, setError] = useState<string | null>(null)
  const [hasAttempted, setHasAttempted] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided')
      return
    }

    if (!isAuthenticated) {
      // Not logged in — redirect to the auth page with token preserved.
      // Auth handles sign-in + sign-up in one flow via Supabase OTP.
      navigate(`${ROUTES.AUTH}?invite=${token}`, { replace: true })
      return
    }

    if (hasAttempted) return

    // Authenticated — accept the invitation
    setHasAttempted(true)
    acceptInvitation.mutate(token, {
      onSuccess: () => {
        navigate(ROUTES.HOME, { replace: true })
      },
      onError: (err) => {
        setError(err.message || 'Failed to accept invitation')
      },
    })
  }, [token, isAuthenticated, hasAttempted, navigate, acceptInvitation])

  // ─── Error State ───────────────────────────────────────────

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-surface">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-sm text-error">{error}</p>
            <Button
              onClick={() => navigate(ROUTES.HOME)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Go to WorkNest
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Loading State ─────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Skeleton className="mx-auto mb-4 h-8 w-48" />
        <p className="text-sm text-text-muted">Accepting invitation...</p>
      </div>
    </div>
  )
}
