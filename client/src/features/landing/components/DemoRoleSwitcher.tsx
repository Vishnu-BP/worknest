/**
 * @file DemoRoleSwitcher.tsx — Interactive RBAC permission matrix
 * @module client/features/landing/components
 *
 * Visualizes the four WorkNest roles (Owner / Admin / Member / Viewer)
 * against the seven key permission categories. Each role button at the
 * top highlights its column in the matrix so a recruiter can see, at
 * a glance, exactly what that role can and can't do. No kanban board
 * re-display — the matrix itself IS the demo.
 *
 * This mirrors the PERMISSION_MATRIX constants in
 * server/src/core/utils/permissions.ts, so what you see on the landing
 * is what the backend enforces.
 *
 * @dependencies react, lucide-react, @core/lib
 * @related client/src/features/landing/components/DemoSection.tsx — parent
 */

import { useState } from 'react'
import { Check, Minus } from 'lucide-react'

import { cn } from '@core/lib'

// ─── Types ─────────────────────────────────────────────────────

type Role = 'owner' | 'admin' | 'member' | 'viewer'

interface RoleInfo {
  value: Role
  label: string
  blurb: string
}

interface Permission {
  label: string
  detail: string
  /** Which roles are allowed this permission */
  allowedFor: Role[]
}

// ─── Data ──────────────────────────────────────────────────────

const ROLES: RoleInfo[] = [
  { value: 'owner',  label: 'Owner',  blurb: 'Full control. Only role that can delete the workspace.' },
  { value: 'admin',  label: 'Admin',  blurb: 'Manages the team and projects, can\u2019t remove the owner.' },
  { value: 'member', label: 'Member', blurb: 'Day-to-day contributor. Creates and moves tasks.' },
  { value: 'viewer', label: 'Viewer', blurb: 'Read-only. Great for stakeholders and clients.' },
]

const PERMISSIONS: Permission[] = [
  {
    label: 'Manage workspace',
    detail: 'Rename, delete, edit billing and default settings',
    allowedFor: ['owner'],
  },
  {
    label: 'Invite & remove members',
    detail: 'Send invitations, revoke access, change member roles',
    allowedFor: ['owner', 'admin'],
  },
  {
    label: 'Create & delete projects',
    detail: 'Spin up new boards, archive old ones',
    allowedFor: ['owner', 'admin'],
  },
  {
    label: 'Manage labels & workflow',
    detail: 'Define status columns, label palettes, task templates',
    allowedFor: ['owner', 'admin'],
  },
  {
    label: 'Create & move tasks',
    detail: 'Add cards, drag between columns, set priority and due date',
    allowedFor: ['owner', 'admin', 'member'],
  },
  {
    label: 'Comment on tasks',
    detail: 'Post comments, edit or delete your own comments',
    allowedFor: ['owner', 'admin', 'member'],
  },
  {
    label: 'View all content',
    detail: 'See every project, task, comment, and activity entry',
    allowedFor: ['owner', 'admin', 'member', 'viewer'],
  },
]

// ─── Component ─────────────────────────────────────────────────

export function DemoRoleSwitcher(): JSX.Element {
  const [active, setActive] = useState<Role>('owner')
  const activeInfo = ROLES.find((r) => r.value === active) ?? ROLES[0]!

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* ─── Role selector chips ───────────────────────── */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Choose a role"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/40 p-1 backdrop-blur-sm"
        >
          {ROLES.map((role) => {
            const isActive = role.value === active
            return (
              <button
                key={role.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(role.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-text-muted hover:text-text',
                )}
              >
                {role.label}
              </button>
            )
          })}
        </div>
        <p className="text-center text-xs text-text-dim md:text-sm">{activeInfo.blurb}</p>
      </div>

      {/* ─── Permission matrix ─────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-surface/40 backdrop-blur-sm">
        {/* Header row */}
        <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,48px)] items-center gap-3 border-b border-border/60 px-4 py-3 md:grid-cols-[minmax(0,1fr)_repeat(4,64px)] md:px-6 md:py-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-dim md:text-xs">
            Permission
          </span>
          {ROLES.map((role) => {
            const isActive = role.value === active
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setActive(role.value)}
                className={cn(
                  'rounded-md py-1 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors md:text-xs',
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text',
                )}
              >
                {role.label}
              </button>
            )
          })}
        </div>

        {/* Permission rows */}
        <ul className="divide-y divide-border/40">
          {PERMISSIONS.map((perm) => (
            <li
              key={perm.label}
              className="grid grid-cols-[minmax(0,1fr)_repeat(4,48px)] items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_repeat(4,64px)] md:px-6"
            >
              <div>
                <p className="text-sm font-medium text-text">{perm.label}</p>
                <p className="mt-0.5 text-xs text-text-dim">{perm.detail}</p>
              </div>
              {ROLES.map((role) => {
                const allowed = perm.allowedFor.includes(role.value)
                const isActive = role.value === active
                return (
                  <div
                    key={role.value}
                    className={cn(
                      'flex h-8 items-center justify-center rounded-md transition-all md:h-9',
                      isActive && 'bg-primary/10 ring-1 ring-primary/30',
                    )}
                  >
                    {allowed ? (
                      <Check
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-primary' : 'text-text-muted',
                        )}
                      />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-text-dim/60" />
                    )}
                  </div>
                )
              })}
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Footnote ──────────────────────────────────── */}
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-text-dim md:text-sm">
        Checked in three places &mdash; the app, the server, and the database itself.
        Nothing slips through the cracks.
      </p>
    </div>
  )
}
