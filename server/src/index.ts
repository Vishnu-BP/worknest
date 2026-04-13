/**
 * @file index.ts — Express server entry point
 * @module server
 *
 * Imports the configured Express app and starts the HTTP server.
 * This file only handles startup — all app configuration (middleware,
 * routes, error handling) lives in app.ts for testability with Supertest.
 *
 * @dependencies server/src/app, server/src/config, server/src/utils
 * @related server/src/app.ts — Express app configuration
 */

import { app } from './app'
import { env } from './core/config'
import { createLogger } from './core/utils'

const log = createLogger('API')

app.listen(env.PORT, () => {
  log.info(`WorkNest API running on port ${env.PORT}`)
})
