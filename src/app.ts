import type { PinoLogger } from 'hono-pino'
import dotenv from 'dotenv'
import { Hono } from 'hono'
import notFound from '@/middlewares/not-found'
import onError from '@/middlewares/on-error'
import { pinoLogger } from '@/middlewares/pino-logger'

import sets from '@/routes/sets'

dotenv.config()

interface AppBindings {
  Variables: {
    logger: PinoLogger
  }
}

const app = new Hono<AppBindings>()

app.use(pinoLogger())
app.notFound(notFound)
app.onError(onError)

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'Hello World',
  })
})

app.route('/sets', sets)

export default app
