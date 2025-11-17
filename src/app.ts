import { Hono } from 'hono'
import notFound from '@/middlewares/not-found'
import sets from '@/routes/sets'

const app = new Hono()

app.notFound(notFound)

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'Hello World',
  })
})

app.route('/sets', sets)

export default app
