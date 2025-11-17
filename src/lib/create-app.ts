import type { AppBindings } from './types'
import { OpenAPIHono } from '@hono/zod-openapi'
import dotenv from 'dotenv'

import notFound from '@/middlewares/not-found'
import onError from '@/middlewares/on-error'
import { pinoLogger } from '@/middlewares/pino-logger'

dotenv.config()

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false })
}

export default function createApp() {
  const app = createRouter()

  app.use(pinoLogger())
  app.notFound(notFound)
  app.onError(onError)

  return app
}
