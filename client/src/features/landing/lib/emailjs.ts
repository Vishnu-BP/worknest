/**
 * @file emailjs.ts — Browser-side EmailJS wrapper for the contact form
 * @module client/features/landing/lib
 *
 * Thin wrapper over @emailjs/browser so the ContactForm component stays
 * free of SDK details. Reads three credentials from `import.meta.env`:
 * service id, template id, and public key. EmailJS's public key is
 * intentionally browser-safe — it authorizes sends without exposing a
 * secret, and the service handles abuse via rate limits on its side.
 *
 * Template parameters (`from_name`, `from_email`, `message`) must match
 * the placeholders configured in the EmailJS template dashboard.
 *
 * @dependencies @emailjs/browser
 * @related client/src/features/landing/components/ContactForm.tsx — caller
 */

import emailjs from '@emailjs/browser'

// ─── Credentials (Vite env) ────────────────────────────────────

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string

// ─── Public API ────────────────────────────────────────────────

export interface ContactMessageInput {
  name: string
  email: string
  message: string
}

/**
 * Sends a contact message via EmailJS. Resolves on 200, throws on any
 * network error or non-2xx response — callers are expected to `try/catch`
 * and surface the failure via toast.
 */
export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name: input.name,
      from_email: input.email,
      message: input.message,
    },
    { publicKey: PUBLIC_KEY },
  )
}
