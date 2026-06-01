/**
 * @file Footer.tsx — Landing-page footer (single-row, minimal)
 * @module client/features/landing/components
 *
 * One-line portfolio footer: brand (left) · quick links (center) ·
 * social icons + "Built by" credit (right). Stacks vertically on
 * mobile. No disclaimer row — the page header already positions
 * WorkNest as a portfolio project.
 *
 * @dependencies lucide-react, react-router-dom
 * @related client/src/features/landing/pages/Landing.tsx — parent
 */

import { Link } from 'react-router-dom'
import { FileDown, Github, Layers, Linkedin, Mail } from 'lucide-react'

import { ROUTES } from '@core/config'

// ─── Constants ─────────────────────────────────────────────────

const GITHUB_URL = 'https://github.com/Vishnu-BP/worknest'
const LINKEDIN_URL = 'https://www.linkedin.com/in/vishnu-bp/'
const EMAIL = 'vishnubp71@gmail.com'
const RESUME_URL = '/Vishnu_resume.pdf'
const CURRENT_YEAR = new Date().getFullYear()

// ─── Component ─────────────────────────────────────────────────

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border/60 bg-background px-4 py-8 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        {/* ─── Brand + tagline ───────────────────────────── */}
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2 text-text transition-colors hover:text-text"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">WorkNest</span>
            <span className="text-xs text-text-dim">
              Project management for small teams
            </span>
          </span>
        </Link>

        {/* ─── Quick links ───────────────────────────────── */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-muted">
          <a href="#features" className="transition-colors hover:text-text">
            Features
          </a>
          <a href="#demo" className="transition-colors hover:text-text">
            Demo
          </a>
          <a href="#architecture" className="transition-colors hover:text-text">
            Architecture
          </a>
          <a href="#about" className="transition-colors hover:text-text">
            About
          </a>
          <a
            href={RESUME_URL}
            download
            className="transition-colors hover:text-text"
          >
            Resume
          </a>
        </nav>

        {/* ─── Socials + copyright ───────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-text-dim md:inline">
            © {CURRENT_YEAR} · Built by{' '}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="text-text-muted transition-colors hover:text-text"
            >
              Vishnu B P
            </a>
          </span>
          <div className="flex items-center gap-1">
            <FooterIcon href={GITHUB_URL} label="GitHub">
              <Github className="h-4 w-4" />
            </FooterIcon>
            <FooterIcon href={LINKEDIN_URL} label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </FooterIcon>
            <FooterIcon href={`mailto:${EMAIL}`} label="Email">
              <Mail className="h-4 w-4" />
            </FooterIcon>
            <FooterIcon href={RESUME_URL} label="Download resume" download>
              <FileDown className="h-4 w-4" />
            </FooterIcon>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Icon link helper ──────────────────────────────────────────

interface FooterIconProps {
  href: string
  label: string
  download?: boolean
  children: React.ReactNode
}

function FooterIcon({ href, label, download, children }: FooterIconProps): JSX.Element {
  return (
    <a
      href={href}
      target={download ? undefined : '_blank'}
      rel="noreferrer"
      download={download}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
    >
      {children}
    </a>
  )
}
