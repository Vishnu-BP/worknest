/**
 * @file WorkspaceSettings.tsx — Workspace settings form + danger zone
 * @module client/features/workspace/components
 *
 * Allows owner/admin to edit workspace name. Danger zone section
 * lets the owner delete the workspace (with confirmation dialog).
 * Receives workspace data as props (smart page fetches, dumb component renders).
 *
 * @dependencies react-hook-form, zod, shadcn/ui, sonner
 * @related client/src/features/workspace/pages/Settings.tsx — renders this
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { updateWorkspaceSchema } from '@worknest/shared'
import type { UpdateWorkspaceSchema, Workspace } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@core/components/ui/dialog'
import { api, workspaceKeys } from '@core/lib'
import { ROUTES } from '@core/config'
import { useQueryClient } from '@tanstack/react-query'

// ─── Component ─────────────────────────────────────────────────

interface WorkspaceSettingsProps {
  workspace: Workspace
}

export function WorkspaceSettings({ workspace }: WorkspaceSettingsProps): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmName, setConfirmName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateWorkspaceSchema>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
    },
  })

  // ─── Update Handler ────────────────────────────────────────

  const onSubmit = async (data: UpdateWorkspaceSchema): Promise<void> => {
    try {
      await api.patch(`/api/workspaces/${workspace.slug}`, data)
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      toast.success('Workspace updated')
    } catch (error) {
      toast.error('Failed to update workspace')
    }
  }

  // ─── Delete Handler ────────────────────────────────────────

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await api.delete(`/api/workspaces/${workspace.slug}`)
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      toast.success('Workspace deleted')
      navigate(ROUTES.HOME)
    } catch (error) {
      toast.error('Failed to delete workspace')
    } finally {
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ─── General Settings ──────────────────────────── */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-text">General</CardTitle>
          <CardDescription className="text-text-muted">
            Manage your workspace settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text">
                Workspace name
              </Label>
              <Input
                id="name"
                className="max-w-md border-border bg-background text-text"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-text">Slug</Label>
              <p className="text-sm text-text-muted">{workspace.slug}</p>
              <p className="text-xs text-text-dim">
                The URL slug cannot be changed after creation.
              </p>
            </div>

            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── Danger Zone ──────────────────────────────── */}
      <Card className="border-error/30 bg-surface">
        <CardHeader>
          <CardTitle className="text-error">Danger Zone</CardTitle>
          <CardDescription className="text-text-muted">
            Irreversible actions that permanently affect this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Delete workspace</p>
              <p className="text-xs text-text-muted">
                Permanently delete this workspace and all its data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Delete Confirmation Dialog ───────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="text-text">Delete workspace</DialogTitle>
            <DialogDescription className="text-text-muted">
              This action cannot be undone. All projects, tasks, members, and
              data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-text">
              Type <span className="font-mono font-bold">{workspace.name}</span> to confirm
            </Label>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="border-border bg-background text-text"
              placeholder={workspace.name}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="text-text-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== workspace.name || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
