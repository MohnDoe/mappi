import { Hono } from 'hono'
import sets from '@/routes/sets'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'Hello World',
  })
})

app.route('/sets', sets)

export default app
