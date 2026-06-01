/**
 * @file InviteDialog.tsx — Member invitation form
 * @module client/features/member/components
 *
 * Form with email input and role selector (member or viewer).
 * Used inside a Dialog on the Members page. Calls useCreateInvitation
 * which creates the invitation and sends the email via Resend.
 *
 * @dependencies react-hook-form, zod, shadcn/ui
 * @related client/src/features/member/hooks/useCreateInvitation.ts
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createInvitationSchema } from '@worknest/shared'
import type { CreateInvitationSchema } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'

import { useCreateInvitation } from '../hooks/useCreateInvitation'

// ─── Component ─────────────────────────────────────────────────

interface InviteDialogProps {
  slug: string
  onSuccess: () => void
}

export function InviteDialog({ slug, onSuccess }: InviteDialogProps): JSX.Element {
  const createInvitation = useCreateInvitation(slug)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateInvitationSchema>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: '', role: 'member' },
  })

  const onSubmit = async (data: CreateInvitationSchema): Promise<void> => {
    await createInvitation.mutateAsync(data)
    reset()
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email" className="text-text">Email address</Label>
        <Input
          id="invite-email"
          type="email"
          placeholder="member@example.com"
          className="border-border bg-background text-text placeholder:text-text-dim"
          autoFocus
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role" className="text-text">Role</Label>
        <select
          id="invite-role"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text"
          {...register('role')}
        >
          <option value="member">Member — can create and edit tasks</option>
          <option value="viewer">Viewer — read-only access</option>
        </select>
        {errors.role && (
          <p className="text-sm text-error">{errors.role.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-white hover:bg-primary/90"
        disabled={isSubmitting || createInvitation.isPending}
      >
        {isSubmitting || createInvitation.isPending ? 'Sending...' : 'Send invitation'}
      </Button>
    </form>
  )
}
