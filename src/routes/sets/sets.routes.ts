import type {
  SuccessStatusCode,
} from 'hono/utils/http-status'
import type {
  ExtendedSet,
} from '@/models/taw.types'
import { createRoute, z } from '@hono/zod-openapi'
import { StatusCodes } from 'http-status-codes'
import { createRouter } from '@/lib/create-app'
import { listSets } from '@/services/sets'
import codeRouter from './[code]/code.routes'

const router = createRouter()

router.openapi(
  createRoute({
    method: 'get',
    path: '/',
    responses: {
      [StatusCodes.OK as SuccessStatusCode]: {
        content: {
          'application/json': {
            schema: z.object({
              sets: z.array(z.object<ExtendedSet>()),
            }),
          },
        },
        description: 'List of available sets',
      },
    },
  }),
  (c) => {
    return c.json(
      {
        sets: listSets(),
      },
      StatusCodes.OK,
    )
  },
)

router.route('/', codeRouter)

export default router
