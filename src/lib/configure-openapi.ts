import type { AppOpenAPI } from './types'

import pkg from '../../package.json'

export function configureOpenApi(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: pkg.version,
      title: 'Mappi API',
    },
  })

  return app
}
