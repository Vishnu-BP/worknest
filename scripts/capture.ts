/**
 * @file capture.ts — Shared Playwright capture engine
 * @module scripts
 *
 * Launches a Chromium session, navigates to the given URL, walks a scripted
 * interaction scenario (initial shot → hover nav CTA → scroll to 50% →
 * scroll to bottom → full-page composition), and captures a named PNG at
 * every step. A .webm screen recording of the whole session is saved too.
 *
 * Output: screenshots/<slug>/<timestamp>/{01-initial.png, 02-*.png, full.png, video.webm}
 *
 * @dependencies playwright
 * @related scripts/capture-landing.ts, scripts/capture-ref.ts — thin wrappers
 */

import { chromium } from 'playwright'
import { mkdir, rename, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// ─── Types ─────────────────────────────────────────────────────

interface CaptureOptions {
  /** URL to navigate to (e.g. http://localhost:5173/) */
  url: string
  /** Folder slug under screenshots/ — e.g. 'landing', 'slack-com' */
  slug: string
  /** 'dark' (default — matches WorkNest brand) or 'light'. Controls
   *  both the emulated prefers-color-scheme AND the localStorage seed
   *  so WorkNest's bootstrap script picks up the right palette. */
  theme?: 'dark' | 'light'
}

// ─── Capture ───────────────────────────────────────────────────

export async function capture({ url, slug, theme = 'dark' }: CaptureOptions): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = resolve('screenshots', slug, `${timestamp}-${theme}`)
  await mkdir(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
    colorScheme: theme,
  })

  // Seed localStorage on any origin so WorkNest's bootstrap script picks
  // the requested palette instead of relying on the OS-level preference.
  await context.addInitScript((t: string) => {
    try {
      localStorage.setItem('worknest_theme', t)
    } catch {
      /* no-op */
    }
  }, theme)
  const page = await context.newPage()

  console.log(`→ Navigating to ${url}`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
  // Small settle for any post-hydration animations
  await page.waitForTimeout(600)

  // ─── 1. Initial above-the-fold ───────────────────────────
  await page.screenshot({ path: `${outDir}/01-initial.png` })
  console.log('  ✓ 01-initial.png')

  // ─── 2. Hover primary CTA (if present) ───────────────────
  const navCta = page
    .locator('nav a, nav button, header a, header button')
    .filter({ hasText: /get started|sign up|try|start free|open your workspace/i })
    .first()
  if (await navCta.count()) {
    await navCta.hover()
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${outDir}/02-nav-cta-hover.png` })
    console.log('  ✓ 02-nav-cta-hover.png')
  } else {
    console.log('  — no nav CTA matched; skipping 02')
  }

  // ─── 3. Scrolled to 50% ──────────────────────────────────
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: 'smooth' }),
  )
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${outDir}/03-scrolled-50pct.png` })
  console.log('  ✓ 03-scrolled-50pct.png')

  // ─── 4. Scrolled to bottom ───────────────────────────────
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
  )
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${outDir}/04-scrolled-bottom.png` })
  console.log('  ✓ 04-scrolled-bottom.png')

  // ─── 5. Back to top + full-page composition shot ─────────
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outDir}/full.png`, fullPage: true })
  console.log('  ✓ full.png')

  // Close context first — flushes video to disk
  await context.close()
  await browser.close()

  // Rename the auto-generated video file to a stable name
  const files = await readdir(outDir)
  const webm = files.find((f) => f.endsWith('.webm'))
  if (webm && webm !== 'video.webm') {
    await rename(`${outDir}/${webm}`, `${outDir}/video.webm`)
  }
  console.log('  ✓ video.webm')

  console.log(`\n✓ Captured '${slug}' → ${outDir}`)
}
