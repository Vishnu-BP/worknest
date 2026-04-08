/**
 * @file main.tsx — React application entry point
 * @module client
 *
 * Mounts the React application to the DOM root element.
 * StrictMode is enabled for development warnings and double-render detection.
 *
 * @dependencies react, react-dom
 * @related client/src/App.tsx — root application component
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Check index.html for <div id="root">.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
