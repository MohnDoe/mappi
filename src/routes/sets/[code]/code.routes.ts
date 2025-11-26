import type { SuccessStatusCode } from 'hono/utils/http-status'
import type { AppBindings } from '@/lib/types'
import type { ExtendedCard, ExtendedSet } from '@/models/taw.types'
import { createRoute, z } from '@hono/zod-openapi'
import { StatusCodes } from 'http-status-codes'
import { createRouter } from '@/lib/create-app'
import setNotFound from '@/middlewares/sets/notFound'
import { Picker } from '@/services/picker'
import { getSet, getSetRates } from '@/services/sets'

type SetCodeRouterBindings = AppBindings & {
  Variables: {
    set: ExtendedSet
  }
}

const codeRouter = createRouter<SetCodeRouterBindings>()

codeRouter.use('/:code/*', async (c, next) => {
  const { code } = c.req.param()
  const set = getSet(code)
  if (!set) {
    return setNotFound(c)
  }
  c.set('set', set)
  await next()
})

codeRouter.openapi(
  createRoute({
    method: 'get',
    path: '/:code/open',
    responses: {
      [StatusCodes.OK as SuccessStatusCode]: {
        content: {
          'application/json': {
            schema: z.object({
              set: z.object<ExtendedSet>(),
              cards: z.array(z.object<ExtendedCard>()),
              seed: z.string(),
              date: z.date(),
            }),
          },
        },
        description: 'Simulate opening a set',
      },
    },
  }),
  (c) => {
    const set = c.get('set')
    const picker = new Picker(set)

    picker.pickBooster()

    const cards = picker.pickCards()

    return c.json(
      {
        set,
        cards,
        seed: picker._seed,
        date: new Date(),
      },
      StatusCodes.OK,
    )
  },
)

codeRouter.openapi(
  createRoute({
    method: 'get',
    path: '/:code/rates',
    responses: {
      [StatusCodes.OK as SuccessStatusCode]: {
        content: {
          'application/json': {
            schema: z.any(),
          },
        },
        description: 'Calculate rates for a set',
      },
    },
  }),
  (c) => {
    const set = c.get('set')

    return c.json(
      getSetRates(set),
      StatusCodes.OK,
    )
  },
)

export default codeRouter
