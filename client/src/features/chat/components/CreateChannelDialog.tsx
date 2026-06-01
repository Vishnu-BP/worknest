/**
 * @file CreateChannelDialog.tsx — New project channel form
 * @module client/features/chat/components
 *
 * Modal-friendly form (caller wraps in <Dialog>). Validates against the
 * shared Zod schema (lowercase, digits, dashes only) and posts via
 * useCreateChannel. On success the parent closes the dialog.
 *
 * @related client/src/features/chat/hooks/useCreateChannel.ts
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createChannelSchema } from '@worknest/shared'
import type { CreateChannelInput } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'

import { useCreateChannel } from '../hooks/useCreateChannel'

interface CreateChannelDialogProps {
  slug: string
  projectId: string
  onSuccess?: (channelId: string) => void
}

export function CreateChannelDialog({
  slug,
  projectId,
  onSuccess,
}: CreateChannelDialogProps): JSX.Element {
  const createChannel = useCreateChannel(slug, projectId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { name: '' },
  })

  const onSubmit = async (data: CreateChannelInput): Promise<void> => {
    const channel = await createChannel.mutateAsync(data)
    onSuccess?.(channel.id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel-name" className="text-text">Channel name</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-dim">#</span>
          <Input
            id="channel-name"
            placeholder="e.g., design"
            className="border-border bg-background pl-7 text-text placeholder:text-text-dim lowercase"
            autoFocus
            {...register('name', {
              onChange: (e) => { e.target.value = e.target.value.toLowerCase() },
            })}
          />
        </div>
        <p className="text-xs text-text-dim">
          Lowercase letters, numbers, and dashes. Visible to all project members.
        </p>
        {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-white hover:bg-primary/90"
        disabled={isSubmitting || createChannel.isPending}
      >
        {isSubmitting || createChannel.isPending ? 'Creating...' : 'Create channel'}
      </Button>
    </form>
  )
}
