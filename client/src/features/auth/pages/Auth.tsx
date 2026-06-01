/**
 * @file Auth.tsx — Unified sign-in / sign-up page (passwordless OTP + OAuth)
 * @module client/features/auth/pages
 *
 * Public route at `/auth`. One page handles both sign-in and sign-up:
 * Supabase's OTP flow auto-creates the account for new emails, so the
 * same form covers first-time and returning users. Flow: (1) collect
 * email and send a 6-digit code, then (2) verify the code. Google and
 * GitHub OAuth are offered as skip-the-email alternatives. On success,
 * `useAuth`'s auth-state listener syncs the store and routes on.
 *
 * Handles the invitation deep-link: `?invite=<token>` is preserved
 * through both flows and forwarded to `/invitations/accept` on success.
 *
 * Visual: split-screen layout (Vesper / Stripe-style). Left column is
 * the form on the theme background; right column is a full-height
 * gradient panel with the brand line and a tilted static kanban
 * mockup. The right panel hides below the `md` breakpoint so the form
 * claims the full viewport on phones.
 *
 * @dependencies react-hook-form, zod, @supabase/supabase-js, shadcn/ui
 * @related client/src/features/auth/hooks/useAuth.ts — post-auth sync
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Github, Layers } from 'lucide-react'

import { ROUTES } from '@core/config'
import { cn, createLogger, supabase } from '@core/lib'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { useAuthStore } from '@core/stores'

import { ThemeToggle } from '@features/landing/components/ThemeToggle'

// ─── Validation Schemas ───────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
})

type EmailFormData = z.infer<typeof emailSchema>
type OtpFormData = z.infer<typeof otpSchema>

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Component ─────────────────────────────────────────────────

export function Auth(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')

  // Safety net: if the store already says we're authed (common when
  // Supabase's OAuth callback lands back on /auth because the Site URL
  // in the dashboard falls back here), forward to the intended target.
  // Without this, the user sits on the login form even though they're
  // signed in — looks like OAuth bounced when it actually succeeded.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading)
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return
    const target = inviteToken
      ? `${ROUTES.INVITE_ACCEPT}?token=${inviteToken}`
      : ROUTES.HOME
    navigate(target, { replace: true })
  }, [isAuthLoading, isAuthenticated, inviteToken, navigate])

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  // ─── Send OTP ─────────────────────────────────────────────

  const handleSendOtp = async (data: EmailFormData): Promise<void> => {
    setAuthError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
    })

    if (error) {
      log.warn('OTP send failed', { error: error.message })
      setAuthError(error.message)
      return
    }

    log.info('OTP sent successfully', { email: data.email })
    setEmail(data.email)
    setStep('otp')
  }

  // ─── Verify OTP ───────────────────────────────────────────

  const handleVerifyOtp = async (data: OtpFormData): Promise<void> => {
    setAuthError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.otp,
      type: 'email',
    })

    if (error) {
      log.warn('OTP verification failed', { error: error.message })
      setAuthError(error.message)
      return
    }

    log.info('OTP verified successfully')

    if (inviteToken) {
      navigate(`${ROUTES.INVITE_ACCEPT}?token=${inviteToken}`)
    } else {
      navigate(ROUTES.HOME)
    }
  }

  // ─── Back to Email Step ───────────────────────────────────

  const handleBack = (): void => {
    setStep('email')
    setAuthError(null)
    otpForm.reset()
  }

  // ─── Resend OTP ───────────────────────────────────────────

  const handleResendOtp = async (): Promise<void> => {
    setAuthError(null)

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      log.warn('OTP resend failed', { error: error.message })
      setAuthError(error.message)
      return
    }

    log.info('OTP resent successfully')
  }

  // ─── OAuth helpers ────────────────────────────────────────
  const getRedirectTo = (): string =>
    inviteToken
      ? `${window.location.origin}${ROUTES.INVITE_ACCEPT}?token=${inviteToken}`
      : `${window.location.origin}${ROUTES.HOME}`

  const handleGoogleLogin = async (): Promise<void> => {
    setAuthError(null)
    setIsGoogleLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectTo() },
    })

    if (error) {
      log.warn('Google OAuth failed', { error: error.message })
      setAuthError(error.message)
      setIsGoogleLoading(false)
    }
  }

  const handleGithubLogin = async (): Promise<void> => {
    setAuthError(null)
    setIsGithubLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: getRedirectTo() },
    })

    if (error) {
      log.warn('GitHub OAuth failed', { error: error.message })
      setAuthError(error.message)
      setIsGithubLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────

  const isAnyOAuthLoading = isGoogleLoading || isGithubLoading

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* ═══ Left — form column ═══════════════════════════ */}
      <div className="relative flex w-full flex-col md:w-1/2 lg:w-[45%]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
          <Link
            to={ROUTES.LANDING}
            className="inline-flex items-center gap-2 text-text transition-colors hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              WorkNest
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Form area — centered vertically in the remaining space */}
        <div className="flex flex-1 items-center justify-center px-6 pb-10 md:px-10">
          <div className="w-full max-w-sm">
            {step === 'email' ? (
              <EmailStep
                form={emailForm}
                onSubmit={handleSendOtp}
                onGoogle={handleGoogleLogin}
                onGithub={handleGithubLogin}
                isGoogleLoading={isGoogleLoading}
                isGithubLoading={isGithubLoading}
                isAnyOAuthLoading={isAnyOAuthLoading}
                authError={authError}
              />
            ) : (
              <OtpStep
                form={otpForm}
                email={email}
                onSubmit={handleVerifyOtp}
                onBack={handleBack}
                onResend={handleResendOtp}
                authError={authError}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="px-6 pb-6 text-center text-xs text-text-dim md:px-10 md:pb-8">
          By continuing, you agree to the Terms and Privacy Policy.
        </p>
      </div>

      {/* ═══ Right — product showcase panel ═══════════════ */}
      <ShowcasePanel />
    </div>
  )
}

// ─── Showcase panel (right column) ─────────────────────────────

/**
 * Full-height gradient panel with the brand line and a tilted static
 * kanban mockup underneath. Hidden below `md`. Pure CSS — no real
 * board component, no dnd-kit — so it never steals focus or scrolls
 * the page on mount.
 */
function ShowcasePanel(): JSX.Element {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary md:block md:w-1/2 lg:w-[55%]">
      {/* Soft radial highlights for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full bg-secondary/40 blur-3xl"
      />

      {/* Content column */}
      <div className="relative flex h-full flex-col px-10 py-12 lg:px-16">
        {/* Brand top-right, echoing the logo on the form side */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Layers className="h-3 w-3" />
            WorkNest
          </div>
        </div>

        {/* Headline block */}
        <div className="mt-16 max-w-md lg:mt-20">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            Your team&rsquo;s nest for work.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80 md:text-base">
            Kanban boards, workspaces, and real-time sync for small teams that
            ship.
          </p>
        </div>

        {/* Tilted kanban mockup — absolutely positioned so it bleeds
            off the right edge for a more dynamic composition. */}
        <div className="pointer-events-none absolute -right-10 bottom-10 w-[540px] origin-bottom-left rotate-[-8deg] lg:-right-4 lg:bottom-16 lg:w-[620px]">
          <KanbanMockup />
        </div>
      </div>
    </div>
  )
}

// ─── Kanban mockup (CSS only) ──────────────────────────────────

interface MockCard {
  titleWidth: string
  tagWidth?: string
  accent?: 'primary' | 'amber' | 'emerald' | 'rose'
}

interface MockColumn {
  label: string
  cards: MockCard[]
}

const MOCK_COLUMNS: MockColumn[] = [
  {
    label: 'Todo',
    cards: [
      { titleWidth: 'w-4/5', tagWidth: 'w-10', accent: 'amber' },
      { titleWidth: 'w-3/5', tagWidth: 'w-12', accent: 'rose' },
      { titleWidth: 'w-5/6' },
    ],
  },
  {
    label: 'In progress',
    cards: [
      { titleWidth: 'w-full', tagWidth: 'w-14', accent: 'primary' },
      { titleWidth: 'w-3/4', tagWidth: 'w-10', accent: 'primary' },
    ],
  },
  {
    label: 'Done',
    cards: [
      { titleWidth: 'w-2/3', tagWidth: 'w-10', accent: 'emerald' },
      { titleWidth: 'w-5/6', tagWidth: 'w-8', accent: 'emerald' },
      { titleWidth: 'w-3/4' },
    ],
  },
]

const ACCENT_CLASS: Record<NonNullable<MockCard['accent']>, string> = {
  primary: 'bg-indigo-200 text-indigo-700',
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
}

function KanbanMockup(): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
      {/* Fake window chrome */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      </div>

      {/* 3-column board */}
      <div className="grid grid-cols-3 gap-3">
        {MOCK_COLUMNS.map((col) => (
          <div key={col.label} className="rounded-lg bg-gray-50 p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
                {col.label}
              </span>
              <span className="text-[9px] text-gray-400">{col.cards.length}</span>
            </div>
            <div className="space-y-2">
              {col.cards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-md border border-gray-200 bg-white p-2 shadow-sm"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[8px] font-medium text-gray-400">
                      WN-{10 + i}
                    </span>
                    {card.accent && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wider',
                          ACCENT_CLASS[card.accent],
                        )}
                      >
                        tag
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'mb-1 h-1.5 rounded bg-gray-300',
                      card.titleWidth,
                    )}
                  />
                  {card.tagWidth && (
                    <div
                      className={cn('h-1 rounded bg-gray-200', card.tagWidth)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Email Step ────────────────────────────────────────────────

interface EmailStepProps {
  form: ReturnType<typeof useForm<EmailFormData>>
  onSubmit: (data: EmailFormData) => Promise<void>
  onGoogle: () => Promise<void>
  onGithub: () => Promise<void>
  isGoogleLoading: boolean
  isGithubLoading: boolean
  isAnyOAuthLoading: boolean
  authError: string | null
}

function EmailStep({
  form,
  onSubmit,
  onGoogle,
  onGithub,
  isGoogleLoading,
  isGithubLoading,
  isAnyOAuthLoading,
  authError,
}: EmailStepProps): JSX.Element {
  const isSubmitting = form.formState.isSubmitting
  const isAnyLoading = isSubmitting || isAnyOAuthLoading

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-text">
          Ready when you are.
        </h1>
        <p className="text-sm text-text-muted">
          Enter your email and we&rsquo;ll send you a 6-digit code.
        </p>
      </div>

      {/* Email form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@work-email.com"
            autoComplete="email"
            disabled={isAnyLoading}
            className={cn(
              'h-11 rounded-lg border-border bg-background px-4 text-sm text-text',
              'placeholder:text-text-dim',
            )}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-error">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {authError && (
          <p className="text-sm text-error">{authError}</p>
        )}

        <Button
          type="submit"
          disabled={isAnyLoading}
          className={cn(
            'h-11 w-full rounded-lg bg-primary text-sm font-medium text-white shadow-md shadow-primary/20',
            'hover:bg-primary/90',
          )}
        >
          {isSubmitting ? 'Sending code…' : 'Continue'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim">
          or
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* OAuth row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onGoogle}
          disabled={isAnyLoading}
          className="h-11 rounded-lg border-border text-text hover:border-primary/40 hover:bg-surface"
        >
          <GoogleIcon className="h-4 w-4" />
          {isGoogleLoading ? 'Redirecting…' : 'Google'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onGithub}
          disabled={isAnyLoading}
          className="h-11 rounded-lg border-border text-text hover:border-primary/40 hover:bg-surface"
        >
          <Github className="h-4 w-4" />
          {isGithubLoading ? 'Redirecting…' : 'GitHub'}
        </Button>
      </div>
    </div>
  )
}

// ─── OTP Step ──────────────────────────────────────────────────

interface OtpStepProps {
  form: ReturnType<typeof useForm<OtpFormData>>
  email: string
  onSubmit: (data: OtpFormData) => Promise<void>
  onBack: () => void
  onResend: () => Promise<void>
  authError: string | null
}

function OtpStep({
  form,
  email,
  onSubmit,
  onBack,
  onResend,
  authError,
}: OtpStepProps): JSX.Element {
  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-text">
          Check your email
        </h1>
        <p className="text-sm text-text-muted">
          We sent a 6-digit code to <span className="text-text">{email}</span>.
          It&rsquo;ll expire in 10 minutes.
        </p>
      </div>

      {/* OTP form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="otp" className="sr-only">
            Verification code
          </Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            disabled={isSubmitting}
            className={cn(
              'h-14 rounded-lg border-border bg-background text-center text-2xl font-semibold tracking-[0.5em] text-text',
              'placeholder:text-text-dim',
            )}
            {...form.register('otp')}
          />
          {form.formState.errors.otp && (
            <p className="text-center text-xs text-error">
              {form.formState.errors.otp.message}
            </p>
          )}
        </div>

        {authError && (
          <p className="text-center text-sm text-error">{authError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'h-11 w-full rounded-lg bg-primary text-sm font-medium text-white shadow-md shadow-primary/20',
            'hover:bg-primary/90',
          )}
        >
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </Button>
      </form>

      {/* Back + resend */}
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Use a different email
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isSubmitting}
          className="text-primary transition-colors hover:text-primary/80"
        >
          Resend code
        </button>
      </div>
    </div>
  )
}

// ─── Google "G" Icon ───────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 11v3.2h7.6c-.3 1.8-1.2 3.3-2.6 4.3l4.2 3.3c2.5-2.3 3.9-5.7 3.9-9.7 0-.9-.1-1.8-.2-2.6H12Z"
      />
      <path
        fill="#34A853"
        d="M5.4 14.3l-1 .8-3.4 2.6C3.2 21.3 7.2 24 12 24c3.2 0 5.9-1.1 7.9-2.9l-4.2-3.3c-1.1.7-2.5 1.2-3.7 1.2-2.9 0-5.3-1.9-6.2-4.5l-.4-.2Z"
      />
      <path
        fill="#4285F4"
        d="M1 6.3C-.3 9 1 13.2 1 13.2l4.4-3.4C5.2 9 5 8.1 5 7.2c0-.9.2-1.8.5-2.6L1 6.3Z"
      />
      <path
        fill="#FBBC05"
        d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.7-3.7C17.9 1 15.2 0 12 0 7.2 0 3.2 2.7 1 6.8l4.4 3.4C6.3 6.7 8.9 4.8 12 4.8Z"
      />
    </svg>
  )
}
