import { configureOpenApi } from '@/lib/configure-openapi'
import createApp from '@/lib/create-app'
import index from '@/routes/index.route'
import sets from '@/routes/sets.route'

const app = createApp()

configureOpenApi(app)

const routers = [
  index,
  sets,
]

routers.forEach((router) => {
  app.route('/', router)
})

export default app
