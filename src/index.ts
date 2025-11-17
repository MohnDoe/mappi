import app from '@/app'
import env from '@/env'

export default {
  port: env.PORT || 3000,
  fetch: app.fetch,
}
