/**
 * @file Onboarding.tsx — First-time user workspace creation
 * @module client/features/workspace/pages
 *
 * Shown when an authenticated user has no workspaces. Redirects to
 * the first workspace if any exist. Otherwise displays a centered
 * card with the workspace creation form.
 *
 * @dependencies react-router-dom, shadcn/ui
 * @related client/src/features/workspace/components/CreateWorkspaceForm.tsx
 */

import { Navigate } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card'
import { Skeleton } from '@core/components/ui/skeleton'
import { ROUTES } from '@core/config'
import { OnboardingLayout } from '@core/components/common/OnboardingLayout'

import { useWorkspaces } from '../hooks/useWorkspaces'
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm'

// ─── Component ─────────────────────────────────────────────────

export function Onboarding(): JSX.Element {
  const { data: workspaces, isLoading } = useWorkspaces()

  // Still loading — show skeleton
  if (isLoading) {
    return (
      <OnboardingLayout>
        <Skeleton className="h-64 w-full rounded-lg" />
      </OnboardingLayout>
    )
  }

  // User already has workspaces — redirect to the first one
  if (workspaces && workspaces.length > 0) {
    return <Navigate to={ROUTES.WORKSPACE(workspaces[0]!.slug)} replace />
  }

  // No workspaces — show creation form
  return (
    <OnboardingLayout>
      <Card className="border-border bg-surface">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-text">
            Welcome to WorkNest
          </CardTitle>
          <CardDescription className="text-text-muted">
            Create your first workspace to get started. Workspaces are where
            your team organizes projects and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkspaceForm />
        </CardContent>
      </Card>
    </OnboardingLayout>
  )
}
