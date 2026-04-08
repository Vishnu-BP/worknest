/**
 * @file vite.config.ts — Vite build configuration
 * @module client
 *
 * Configures Vite with React plugin and path aliases matching tsconfig.
 * Aliases allow importing from @/ (src) and @shared/ (shared package)
 * so both TypeScript and Vite resolve the same paths.
 *
 * @dependencies vite, @vitejs/plugin-react
 * @related client/tsconfig.json — path aliases must match
 */

import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
