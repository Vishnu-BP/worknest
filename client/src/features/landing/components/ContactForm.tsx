/**
 * @file ContactForm.tsx — Name / email / message form for /contact
 * @module client/features/landing/components
 *
 * Submits directly to EmailJS from the browser — no backend hop. Zod
 * validates client-side; server-side trust is EmailJS's concern. Sonner
 * toasts confirm success / failure so the user gets instant feedback.
 * Button label swaps to "Sending…" while in flight and the whole form
 * is disabled so a double-submit can't slip through.
 *
 * @dependencies react-hook-form, zod, @hookform/resolvers/zod, sonner
 * @related client/src/features/landing/lib/emailjs.ts — SDK wrapper
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { cn } from '@core/lib'

import { sendContactMessage } from '../lib/emailjs'

// ─── Schema ────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, 'Please tell me your name'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'A bit more detail helps — 10+ characters'),
})

type ContactValues = z.infer<typeof contactSchema>

// ─── Component ─────────────────────────────────────────────────

export function ContactForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendContactMessage(values)
      toast.success("Thanks! Message sent — I'll reply soon.")
      reset()
    } catch {
      toast.error("Couldn't send. Try again or email vishnubp71@gmail.com.")
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* ─── Name ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="contact-name" className="text-text">
          Name
        </Label>
        <Input
          id="contact-name"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          disabled={isSubmitting}
          className="border-border bg-background text-text placeholder:text-text-dim"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      {/* ─── Email ────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="contact-email" className="text-text">
          Email
        </Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          className="border-border bg-background text-text placeholder:text-text-dim"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      {/* ─── Message ──────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-text">
          Message
        </Label>
        <textarea
          id="contact-message"
          rows={6}
          placeholder="Tell me a bit about what you're working on, or just say hi…"
          disabled={isSubmitting}
          className={cn(
            'flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
            'text-text placeholder:text-text-dim',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
          )}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-sm text-error">{errors.message.message}</p>
        )}
      </div>

      {/* ─── Submit ───────────────────────────────────────── */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        {isSubmitting ? (
          'Sending…'
        ) : (
          <>
            Send message
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
