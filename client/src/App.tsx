/**
 * @file App.tsx — Root application component
 * @module client
 *
 * Top-level component that will host React Router, QueryClient provider,
 * and Toaster in later phases. Currently renders a minimal placeholder
 * with a shared package import to verify cross-package resolution.
 *
 * @dependencies react, @worknest/shared
 * @related client/src/main.tsx — mounts this component
 */

import { TASK_STATUS_ORDER } from '@worknest/shared'

export function App(): JSX.Element {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        WorkNest
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Multi-tenant SaaS project management tool
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {TASK_STATUS_ORDER.map((status) => (
          <span
            key={status}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
            }}
          >
            {status}
          </span>
        ))}
      </div>
    </div>
  )
}
