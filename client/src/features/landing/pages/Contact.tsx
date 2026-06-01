/**
 * @file Contact.tsx — "Say Hi" page with EmailJS-powered form at `/contact`
 * @module client/features/landing/pages
 *
 * Split layout: a short "Let's talk" blurb and the four social links on
 * the left, the name / email / message form on the right. Reuses the
 * landing nav + footer so the page feels part of the site — the nav's
 * `/#features` style links route back to the landing and scroll to the
 * matching section on arrival (see `Landing.tsx` hash-scroll effect).
 *
 * Mobile stacks vertically: blurb first, then form.
 *
 * @dependencies react-router-dom, lucide-react
 * @related client/src/features/landing/components/ContactForm.tsx — form
 * @related client/src/features/landing/components/LandingNav.tsx — top nav
 */

import { FileDown, Github, Linkedin, Mail } from 'lucide-react'

import { Card, CardContent } from '@core/components/ui/card'
import { cn } from '@core/lib'

import { ContactForm } from '../components/ContactForm'
import { Footer } from '../components/Footer'
import { LandingNav } from '../components/LandingNav'

// ─── Constants ─────────────────────────────────────────────────

const GITHUB_URL = 'https://github.com/Vishnu-BP/worknest'
const LINKEDIN_URL = 'https://www.linkedin.com/in/vishnu-bp/'
const EMAIL = 'vishnubp71@gmail.com'
const RESUME_URL = '/Vishnu_resume.pdf'

// ─── Page ──────────────────────────────────────────────────────

export function Contact(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <LandingNav />

      <main className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-14">
          {/* ─── Left: intro + social ──────────────────────── */}
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary md:text-xs">
              Say Hi
            </p>
            <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
              Let&rsquo;s talk.
            </h1>
            <p className="max-w-md text-balance text-sm leading-relaxed text-text-muted md:text-base">
              Whether it&rsquo;s about hiring, a collaboration, or just a
              hello &mdash; drop a note. I usually reply within a day.
            </p>

            <div className="mt-8 flex items-center gap-2">
              <SocialIconLink href={GITHUB_URL} label="GitHub">
                <Github className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink href={LINKEDIN_URL} label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink href={`mailto:${EMAIL}`} label="Email" sameTab>
                <Mail className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink href={RESUME_URL} label="Download resume" download>
                <FileDown className="h-4 w-4" />
              </SocialIconLink>
            </div>
          </div>

          {/* ─── Right: form card ──────────────────────────── */}
          <Card className="border-border/60 bg-surface/40 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Social Icon Link ──────────────────────────────────────────

interface SocialIconLinkProps {
  href: string
  label: string
  /** `true` skips target="_blank" — used for `mailto:` so Gmail opens in the same tab flow. */
  sameTab?: boolean
  download?: boolean
  children: React.ReactNode
}

function SocialIconLink({
  href,
  label,
  sameTab,
  download,
  children,
}: SocialIconLinkProps): JSX.Element {
  return (
    <a
      href={href}
      target={sameTab || download ? undefined : '_blank'}
      rel="noreferrer"
      download={download}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md',
        'border border-border/60 bg-background/40 text-text-muted',
        'transition-colors hover:border-primary/40 hover:bg-surface hover:text-text',
      )}
    >
      {children}
    </a>
  )
}
