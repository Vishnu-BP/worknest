/**
 * @file AboutSection.tsx — "About the builder" narrative section
 * @module client/features/landing/components
 *
 * Editorial-style section anchored at `#about`. Built around an
 * asymmetric 5/7 two-column composition: a crafted monogram signature
 * card on the left (identity + status), and a typographically-weighted
 * editorial bio on the right (lead paragraph reads like a pull quote,
 * supporting paragraph sits smaller + muted). Skills are grouped by
 * domain in the same pill style as `ArchitectureSection` so the two
 * sections feel like part of one system. The two-row CTA block at the
 * bottom is unchanged — just LinkedIn / GitHub / Resume + Contact.
 *
 * @dependencies react-router-dom, lucide-react, @core/components/ui/button
 * @related client/src/features/landing/components/ArchitectureSection.tsx — grouped-pill pattern
 * @related client/src/features/landing/pages/Landing.tsx — parent
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  FileDown,
  GraduationCap,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react'

import { ROUTES } from '@core/config'
import { Button } from '@core/components/ui/button'
import { cn } from '@core/lib'

// ─── Data ──────────────────────────────────────────────────────

const GITHUB_URL = 'https://github.com/Vishnu-BP/worknest'
const LINKEDIN_URL = 'https://www.linkedin.com/in/vishnu-bp/'
const RESUME_URL = '/Vishnu_resume.pdf'

interface SkillGroup {
  label: string
  items: string[]
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'Frontend',
    items: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'TanStack Query',
      'Zustand',
      'dnd-kit',
      'React Native',
    ],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Express', 'FastAPI', 'Python'],
  },
  {
    label: 'Data & Infra',
    items: ['Supabase', 'PostgreSQL', 'Drizzle ORM', 'Docker', 'Sentry'],
  },
]

// ─── Section ───────────────────────────────────────────────────

export function AboutSection(): JSX.Element {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-t border-border/40 bg-background px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        {/* ─── Header ────────────────────────────────────── */}
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary md:text-xs">
            About the builder
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            Hi, I&rsquo;m Vishnu.
          </h2>
        </div>

        {/* ─── Bio — 5/7 asymmetric split ────────────────── */}
        <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-[5fr_7fr] md:items-start md:gap-12">
          <SignatureCard />
          <EditorialBio />
        </div>

        {/* ─── Skills — grouped ──────────────────────────── */}
        <div className="mb-12 md:mb-16">
          <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim md:text-xs">
            What I work with
          </p>
          <div className="mx-auto max-w-3xl space-y-5">
            {SKILL_GROUPS.map((group) => (
              <div
                key={group.label}
                className="flex flex-col items-center gap-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim md:text-xs">
                  {group.label}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {group.items.map((label) => (
                    <SkillPill key={label} label={label} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Closing invitation card ────────────────────
            Single framed CTA block that reads like the section's
            conclusion — tagline + headline + primary message button
            with an arrow-slide on hover, then a divider into quieter
            text-link socials. Replaces the earlier 4-button stack. */}
        <ClosingCTA />
      </div>
    </section>
  )
}

// ─── Closing CTA card ──────────────────────────────────────────

function ClosingCTA(): JSX.Element {
  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Ambient glow behind the card. Soft, offset, blurred — adds
          depth without a heavy shadow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/15 blur-3xl"
      />

      <div className="relative px-6 py-10 md:px-10 md:py-12">
        <div className="text-center">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary md:text-xs">
            Get in touch
          </p>
          <h3 className="mb-3 text-balance text-2xl font-bold tracking-tight text-text md:text-3xl">
            Let&rsquo;s build something.
          </h3>
          <p className="mx-auto mb-8 max-w-md text-balance text-sm leading-relaxed text-text-muted md:text-base">
            Drop a note about hiring, a collaboration, or just to say hi.
            I usually reply within a day.
          </p>

          {/* Primary CTA */}
          <Button
            asChild
            size="lg"
            className={cn(
              'group h-12 gap-2 bg-primary px-6 text-white shadow-lg shadow-primary/30',
              'hover:bg-primary/90 hover:shadow-primary/40',
            )}
          >
            <Link to={ROUTES.CONTACT}>
              <Mail className="h-4 w-4" />
              Send me a message
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

          {/* Divider */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim">
              or find me on
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          {/* Secondary text-link row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-muted">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-text"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-text"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={RESUME_URL}
              download
              className="inline-flex items-center gap-1.5 transition-colors hover:text-text"
            >
              <FileDown className="h-4 w-4" />
              Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Signature card (left column) ──────────────────────────────

/**
 * Crafted identity block — monogram + name + stat lines + open-to-work
 * pill. A soft ambient-glow pseudo-element sits behind the card so the
 * section gets depth without a heavy drop shadow. The `ring-inset`
 * adds a 1px inner highlight that reads as glass in dark mode and as
 * subtle gloss in light mode.
 */
function SignatureCard(): JSX.Element {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border/60 bg-surface/40 p-6 backdrop-blur-sm',
        'ring-1 ring-inset ring-white/[0.04]',
        // Ambient primary-color glow behind the card
        'before:pointer-events-none before:absolute before:-left-10 before:-top-10',
        'before:-z-10 before:h-48 before:w-48 before:rounded-full before:bg-primary/20 before:blur-3xl',
      )}
    >
      {/* ─── Monogram + name ─────────────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Gradient-rim monogram: outer 1.5px gradient, inner dark disc
            with the V letter in gradient fill. Soft primary halo. */}
        <div className="rounded-full bg-gradient-to-br from-primary/70 to-secondary/60 p-[1.5px] shadow-[0_0_24px] shadow-primary/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-xl font-bold tracking-wide text-transparent">
              V
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-text">
            Vishnu B P
          </p>
          <p className="text-sm text-text-muted">Full-stack engineer</p>
        </div>
      </div>

      {/* ─── Divider ────────────────────────────────────── */}
      <hr className="my-5 border-border/40" />

      {/* ─── Stat lines ─────────────────────────────────── */}
      <ul className="space-y-2.5 text-sm text-text-muted">
        <StatLine
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          label="B.E Computer Science · VTU"
        />
        <StatLine
          icon={<CalendarCheck className="h-3.5 w-3.5" />}
          label="Graduating June 2026"
        />
        <StatLine
          icon={<Briefcase className="h-3.5 w-3.5" />}
          label="SE Intern @ Scaleswift"
        />
      </ul>

      {/* ─── Open-to-work pill ──────────────────────────── */}
      <div className="mt-6">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full',
            'border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400',
          )}
        >
          <span
            aria-hidden="true"
            className="relative flex h-1.5 w-1.5"
          >
            {/* Outer pulse ring + solid inner dot so the signal is
                visible but not distracting. */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Open to full-stack roles
        </span>
      </div>
    </div>
  )
}

// ─── Editorial bio (right column) ──────────────────────────────

/**
 * Typography-driven bio. The lead paragraph is heavier + larger so the
 * eye lands there first; the supporting paragraph is muted so it reads
 * as context rather than competition.
 */
function EditorialBio(): JSX.Element {
  return (
    <div className="space-y-5">
      <p className="text-balance text-lg font-medium leading-relaxed text-text md:text-xl">
        I built WorkNest to learn the boring, load-bearing parts of a real
        multi-tenant SaaS &mdash; the stuff most portfolio projects skip.
        Three-layer auth. Row-Level Security. Fractional indexing on a
        drag-and-drop board. Real-time sync that actually syncs. Every
        piece written from scratch so I could own the decisions behind it.
      </p>
      <p className="text-sm leading-relaxed text-text-muted md:text-base">
        Day-to-day I&rsquo;m interning at Scaleswift, shipping React Native
        and Supabase. I graduate in June 2026 and I&rsquo;m looking for
        Full-Stack / Software Engineer roles where system-design matters.
        If any of that sounds like your team, say hi &mdash; my inbox is
        open.
      </p>
    </div>
  )
}

// ─── Small pieces ──────────────────────────────────────────────

function StatLine({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}): JSX.Element {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/40 text-text-dim">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </li>
  )
}

function SkillPill({ label }: { label: string }): JSX.Element {
  return (
    <span
      className={cn(
        'rounded-full border border-border/60 bg-background/50 px-3 py-1.5',
        'text-xs font-medium text-text-muted backdrop-blur-sm',
        'transition-colors hover:border-primary/40 hover:text-text',
      )}
    >
      {label}
    </span>
  )
}
