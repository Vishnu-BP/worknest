/**
 * @file CreateWorkspaceForm.tsx — Workspace creation form
 * @module client/features/workspace/components
 *
 * Simple form with workspace name input. Slug is auto-generated
 * server-side. On submit, calls useCreateWorkspace which creates
 * the workspace, navigates to it, and updates localStorage.
 *
 * Used in: Onboarding page and "Create workspace" dialog from switcher.
 *
 * @dependencies react-hook-form, zod, shadcn/ui
 * @related client/src/features/workspace/hooks/useCreateWorkspace.ts
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createWorkspaceSchema } from '@worknest/shared'
import type { CreateWorkspaceSchema } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'

import { useCreateWorkspace } from '../hooks/useCreateWorkspace'

// ─── Component ─────────────────────────────────────────────────

interface CreateWorkspaceFormProps {
  /** Called after successful creation (e.g., to close a dialog) */
  onSuccess?: () => void
}

export function CreateWorkspaceForm({ onSuccess }: CreateWorkspaceFormProps): JSX.Element {
  const createWorkspace = useCreateWorkspace()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceSchema>({
    resolver: zodResolver(createWorkspaceSchema),
  })

  const onSubmit = async (data: CreateWorkspaceSchema): Promise<void> => {
    await createWorkspace.mutateAsync(data)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name" className="text-text">
          Workspace name
        </Label>
        <Input
          id="workspace-name"
          type="text"
          placeholder="e.g., Acme Corp"
          className="border-border bg-background text-text placeholder:text-text-dim"
          autoFocus
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
        <p className="text-xs text-text-dim">
          A URL-friendly slug will be generated automatically.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-white hover:bg-primary/90"
        disabled={isSubmitting || createWorkspace.isPending}
      >
        {isSubmitting || createWorkspace.isPending ? 'Creating...' : 'Create workspace'}
      </Button>
    </form>
  )
}
