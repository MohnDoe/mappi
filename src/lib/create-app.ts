import type { AppBindings } from './types'
import { OpenAPIHono } from '@hono/zod-openapi'
import dotenv from 'dotenv'

import { auth } from '@/lib/auth'
import defaultHook from '@/middlewares/default-hook'
import notFound from '@/middlewares/not-found'
import onError from '@/middlewares/on-error'
import { pinoLogger } from '@/middlewares/pino-logger'

dotenv.config()

export function createRouter<T extends AppBindings = AppBindings>() {
  return new OpenAPIHono<T>({
    strict: false,
    defaultHook,
  })
}

export default function createApp() {
  const app = createRouter()

  app.use(pinoLogger())
  app.notFound(notFound)
  app.onError(onError)

  app.on(['POST', 'GET'], '/api/auth/*', c => auth.handler(c.req.raw))

  return app
}
