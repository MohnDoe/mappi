import { createRoute, z } from '@hono/zod-openapi'
import { createRouter } from '@/lib/create-app'

const router = createRouter()

router.openapi(createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'List of available sets',
    },
  },
}), (c) => { return c.json({ message: 'sets' }) })

export default router
