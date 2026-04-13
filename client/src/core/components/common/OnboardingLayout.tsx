/**
 * @file OnboardingLayout.tsx — Centered layout for first-time users
 * @module client/core/components/common
 *
 * Simple centered card layout used when the user has no workspaces yet.
 * No sidebar, no header — just a centered content area for the
 * workspace creation form.
 *
 * @dependencies none
 * @related client/src/features/workspace/pages/Onboarding.tsx
 */

export function OnboardingLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
