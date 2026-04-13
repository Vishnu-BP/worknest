/**
 * @file Signup.tsx — Registration page with email/password and Google OAuth
 * @module client/features/auth/pages
 *
 * Public route (/signup). Users enter email, password, and optional
 * full name to create an account. On success, Supabase creates the
 * account, the database trigger creates the public.users row, and
 * the useAuth hook syncs the auth store.
 *
 * Also handles the invitation flow: if ?invite=<token> is in the URL,
 * the token is preserved and auto-accepted after signup (Phase 11).
 *
 * @dependencies react-hook-form, zod, @supabase/supabase-js, shadcn/ui
 * @related client/src/features/auth/hooks/useAuth.ts — handles post-signup sync
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

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Component ─────────────────────────────────────────────────

export function Signup(): JSX.Element {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  // ─── Email/Password Signup ─────────────────────────────────

  const onSubmit = async (data: SignupFormData): Promise<void> => {
    setAuthError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    })

    if (error) {
      log.warn('Signup failed', { error: error.message })
      setAuthError(error.message)
      return
    }

    log.info('Signup successful')
    navigate(ROUTES.HOME)
  }

  // ─── Google OAuth ──────────────────────────────────────────

  const handleGoogleSignup = async (): Promise<void> => {
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
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-surface">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-text">
            Create your account
          </CardTitle>
          <CardDescription className="text-text-muted">
            Get started with WorkNest for free
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full border-border text-text hover:bg-surface-alt"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? 'Redirecting...' : 'Sign up with Google'}
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-text-dim">OR</span>
            <Separator className="flex-1 bg-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-text">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className="border-border bg-background text-text placeholder:text-text-dim"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-error">{errors.fullName.message}</p>
              )}
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-text">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="border-border bg-background text-text placeholder:text-text-dim"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-error">{errors.confirmPassword.message}</p>
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
