import type { AppOpenAPI } from './types'

import { Scalar } from '@scalar/hono-api-reference'
import pkg from '../../package.json'

export function configureOpenApi(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: pkg.version,
      title: 'Mappi API',
    },
  })

  app.get('/reference', Scalar({
    url: '/doc',
    defaultHttpClient: {
      targetKey: 'js',
      clientKey: 'fetch',
    },
  }))

  return app
}
