import { configureOpenApi } from '@/lib/configure-openapi'
import createApp from '@/lib/create-app'
import sets from '@/routes/sets/sets.routes'

const app = createApp()

configureOpenApi(app)

app.route('/sets', sets)

export default app
