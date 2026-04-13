/**
 * @file main.tsx — React application entry point
 * @module client
 *
 * Mounts the React application with all required providers:
 *   - StrictMode for development warnings
 *   - BrowserRouter for client-side routing
 *   - QueryClientProvider for TanStack Query (server state)
 *   - Toaster for toast notifications (sonner)
 *
 * @dependencies react, react-dom, react-router-dom, @tanstack/react-query, sonner
 * @related client/src/App.tsx — root component with route definitions
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { queryClient } from '@core/lib'

import { App } from './App'
import './index.css'

// ─── Mount ─────────────────────────────────────────────────────

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Check index.html for <div id="root">.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
