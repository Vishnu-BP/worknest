/**
 * @file App.tsx — Root application component with route definitions
 * @module client
 *
 * Defines the React Router route structure:
 *   - Public: /auth (no auth)
 *   - Protected:
 *     - / → redirect to last workspace or onboarding
 *     - /onboarding → create first workspace
 *     - /w/:slug → WorkspaceLayout (sidebar + header + outlet)
 *       - index → WorkspaceDashboard
 *       - members → Members page
 *       - settings → Settings page
 *
 * useAuth() hook syncs Supabase auth state at the top level.
 * CreateWorkspace dialog is managed by uiStore.activeModal.
 *
 * @dependencies react-router-dom
 * @related client/src/main.tsx — wraps this with providers
 */

import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTES, LAST_WORKSPACE_KEY } from '@core/config'
import { AuthGuard } from '@core/components/common/AuthGuard'
import { WorkspaceLayout } from '@core/components/common/WorkspaceLayout'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@core/components/ui/dialog'
import { Skeleton } from '@core/components/ui/skeleton'
import { useUIStore } from '@core/stores'

import { useAuth, Auth } from '@features/auth'
import {
  Onboarding,
  WorkspaceDashboard,
  WorkspaceSettingsPage,
  CreateWorkspaceForm,
  useWorkspaces,
} from '@features/workspace'
import { Members } from '@features/member'
import { ProjectBoard, ProjectLayout, CreateProjectDialog } from '@features/project'
import { ProjectChatPage } from '@features/chat'
import { Activity } from '@features/activity'
import { InviteAccept } from '@features/invitation'
import { Contact, Landing } from '@features/landing'

// ─── App ───────────────────────────────────────────────────────

export function App(): JSX.Element {
  useAuth()

  return (
    <>
      <Routes>
        {/* ─── Public Routes ──────────────────────────── */}
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.AUTH} element={<Auth />} />
        <Route path="/invite-accept" element={<InviteAccept />} />

        {/* ─── Protected Routes ───────────────────────── */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <ProtectedRoutes />
            </AuthGuard>
          }
        />
      </Routes>

      {/* ─── Global Modals ────────────────────────────── */}
      <CreateWorkspaceDialog />
      <CreateProjectModalDialog />
    </>
  )
}

// ─── Protected Routes ──────────────────────────────────────────

function ProtectedRoutes(): JSX.Element {
  return (
    <Routes>
      {/* Authed entry point → redirect to last workspace or onboarding */}
      <Route path="app" element={<HomeRedirect />} />

      {/* Onboarding — create first workspace */}
      <Route path="onboarding" element={<Onboarding />} />

      {/* Workspace layout with nested child routes */}
      <Route path="w/:slug" element={<WorkspaceLayout />}>
        <Route index element={<WorkspaceDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="settings" element={<WorkspaceSettingsPage />} />
        <Route path="projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<ProjectBoard />} />
          <Route path="chat" element={<ProjectChatPage />} />
          <Route path="chat/:channelId" element={<ProjectChatPage />} />
        </Route>
        <Route path="activity" element={<Activity />} />
      </Route>

      {/* Catch unmatched authed path → send to /app (HomeRedirect) */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

// ─── Home Redirect Logic ───────────────────────────────────────

/**
 * Determines where to send the user after login:
 *   1. If no workspaces → /onboarding
 *   2. If lastWorkspaceSlug in localStorage → /w/:slug
 *   3. Otherwise → first workspace
 */
function HomeRedirect(): JSX.Element {
  const { data: workspaces, isLoading } = useWorkspaces()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  // No workspaces → onboarding
  if (!workspaces || workspaces.length === 0) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  // Try last visited workspace
  const lastSlug = localStorage.getItem(LAST_WORKSPACE_KEY)
  if (lastSlug && workspaces.some((w) => w.slug === lastSlug)) {
    return <Navigate to={ROUTES.WORKSPACE(lastSlug)} replace />
  }

  // Fallback to first workspace
  return <Navigate to={ROUTES.WORKSPACE(workspaces[0]!.slug)} replace />
}

// ─── Create Project Dialog ─────────────────────────────────────

/**
 * Global dialog triggered by WorkspaceDashboard's "Create project" button
 * or the empty state CTA. Controlled by uiStore.activeModal.
 */
function CreateProjectModalDialog(): JSX.Element {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const isOpen = activeModal === 'createProject'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="border-border bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text">Create project</DialogTitle>
        </DialogHeader>
        <CreateProjectDialog onSuccess={closeModal} />
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Workspace Dialog ───────────────────────────────────

/**
 * Global dialog triggered by WorkspaceSwitcher's "Create workspace" button.
 * Controlled by uiStore.activeModal state.
 */
function CreateWorkspaceDialog(): JSX.Element {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const isOpen = activeModal === 'createWorkspace'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="border-border bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text">Create workspace</DialogTitle>
        </DialogHeader>
        <CreateWorkspaceForm onSuccess={closeModal} />
      </DialogContent>
    </Dialog>
  )
}
