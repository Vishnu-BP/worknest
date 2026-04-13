/**
 * @file CreateProjectDialog.tsx — Project creation form
 * @module client/features/project/components
 *
 * Form with fields: name (required), key (auto-suggested from name,
 * 2-5 uppercase), color (8 presets + custom picker), description (optional).
 * Used inside a Dialog controlled by uiStore or as a standalone form.
 *
 * Key auto-suggestion: "Engineering" → "ENG" (first 3 uppercase letters).
 * The key field auto-uppercases input and is editable by the user.
 *
 * @dependencies react-hook-form, zod, shadcn/ui
 * @related client/src/features/project/hooks/useCreateProject.ts
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { createProjectSchema } from '@worknest/shared'
import type { CreateProjectSchema } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'

import { useCreateProject } from '../hooks/useCreateProject'

// ─── Constants ─────────────────────────────────────────────────

const COLOR_PRESETS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4',
]

// ─── Component ─────────────────────────────────────────────────

interface CreateProjectDialogProps {
  onSuccess?: () => void
}

export function CreateProjectDialog({ onSuccess }: CreateProjectDialogProps): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const createProject = useCreateProject(slug!)
  const [hasEditedKey, setHasEditedKey] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      color: COLOR_PRESETS[0],
      description: '',
    },
  })

  const watchName = watch('name')
  const watchColor = watch('color')

  // Auto-suggest key from name (only if user hasn't manually edited key)
  useEffect(() => {
    if (watchName && !hasEditedKey) {
      setValue('key', generateProjectKey(watchName))
    }
  }, [watchName, hasEditedKey, setValue])

  const onSubmit = async (data: CreateProjectSchema): Promise<void> => {
    await createProject.mutateAsync(data)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-text">
          Project name
        </Label>
        <Input
          id="project-name"
          placeholder="e.g., Engineering"
          className="border-border bg-background text-text placeholder:text-text-dim"
          autoFocus
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      {/* Key */}
      <div className="space-y-2">
        <Label htmlFor="project-key" className="text-text">
          Project key
        </Label>
        <Input
          id="project-key"
          placeholder="e.g., ENG"
          maxLength={5}
          className="border-border bg-background text-text placeholder:text-text-dim uppercase"
          {...register('key', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase()
              setHasEditedKey(true)
            },
          })}
        />
        <p className="text-xs text-text-dim">
          2-5 characters. Task numbers use this prefix (e.g., ENG-1, ENG-2).
        </p>
        {errors.key && (
          <p className="text-sm text-error">{errors.key.message}</p>
        )}
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label className="text-text">Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className="h-7 w-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: watchColor === color ? '#fafafa' : 'transparent',
                }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={watchColor}
            onChange={(e) => setValue('color', e.target.value)}
            className="h-7 w-8 cursor-pointer rounded border border-border bg-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="project-description" className="text-text">
          Description
          <span className="ml-1 text-text-dim">(optional)</span>
        </Label>
        <textarea
          id="project-description"
          placeholder="What is this project about?"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-error">{errors.description.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-primary text-white hover:bg-primary/90"
        disabled={isSubmitting || createProject.isPending}
      >
        {isSubmitting || createProject.isPending ? 'Creating...' : 'Create project'}
      </Button>
    </form>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Auto-suggests a project key from the name.
 * Takes first 3 uppercase letters of the name.
 * "Engineering" → "ENG", "Payments" → "PAY", "QA" → "QA"
 */
function generateProjectKey(name: string): string {
  const letters = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (letters.length <= 2) return letters
  return letters.slice(0, 3)
}
