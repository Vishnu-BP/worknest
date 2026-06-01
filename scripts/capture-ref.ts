/**
 * @file capture-ref.ts — Capture a reference site for design comparison
 * @module scripts
 *
 * Pass any URL as the first CLI arg and get the same storyboard + video
 * output as our own landing capture. Useful to build a library of
 * interaction patterns from Slack / Linear / Notion / etc. Usage:
 *   npm run capture:ref -- https://slack.com/intl/en-in/
 *
 * @dependencies playwright, ./capture
 */

import { capture } from './capture'

const url = process.argv[2]

if (!url) {
  console.error('Usage: npm run capture:ref -- <url>')
  console.error('Example: npm run capture:ref -- https://slack.com/intl/en-in/')
  process.exit(1)
}

// Derive a safe folder slug from the hostname (e.g. https://slack.com/intl → slack-com)
const slug = new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()

void capture({ url, slug }).catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
