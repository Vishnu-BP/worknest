/**
 * @file Login.tsx — Login page with email/password and Google OAuth
 * @module client/features/auth/pages
 *
 * Public route (/login). Users enter email + password or click
 * "Sign in with Google". On success, Supabase fires onAuthStateChange
 * which the useAuth hook catches to sync the auth store, then the
 * router redirects to the protected workspace route.
 *
 * @dependencies react-hook-form, zod, @supabase/supabase-js, shadcn/ui
 * @related client/src/features/auth/hooks/useAuth.ts — handles post-login sync
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { ROUTES } from '@core/config'
import { createLogger, supabase } from '@core/lib'
import { Button } from '@core/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Separator } from '@core/components/ui/separator'

// ─── Validation Schema ─────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Component ─────────────────────────────────────────────────

export function Login(): JSX.Element {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // ─── Email/Password Login ──────────────────────────────────

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      log.warn('Login failed', { error: error.message })
      setAuthError(error.message)
      return
    }

    log.info('Login successful')
    navigate(ROUTES.HOME)
  }

  // ─── Google OAuth ──────────────────────────────────────────

  const handleGoogleLogin = async (): Promise<void> => {
    setAuthError(null)
    setIsGoogleLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${ROUTES.HOME}`,
      },
    })

    if (error) {
      log.warn('Google OAuth failed', { error: error.message })
      setAuthError(error.message)
      setIsGoogleLoading(false)
    }
    // On success, browser redirects to Google — no further action needed
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-surface">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-text">
            Sign in to WorkNest
          </CardTitle>
          <CardDescription className="text-text-muted">
            Enter your credentials to access your workspaces
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full border-border text-text hover:bg-surface-alt"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? 'Redirecting...' : 'Sign in with Google'}
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-text-dim">OR</span>
            <Separator className="flex-1 bg-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border-border bg-background text-text placeholder:text-text-dim"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border-border bg-background text-text placeholder:text-text-dim"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            {authError && (
              <p className="text-sm text-error">{authError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
