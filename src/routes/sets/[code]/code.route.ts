import type { SuccessStatusCode } from 'hono/utils/http-status'
import type { AppBindings } from '@/lib/types'
import type { ExtendedBooster, ExtendedCard, ExtendedSet } from '@/models/taw.types'
import { createRoute, z } from '@hono/zod-openapi'
import { StatusCodes } from 'http-status-codes'
import { createRouter } from '@/lib/create-app'
import setNotFound from '@/middlewares/sets/notFound'
import { Picker } from '@/services/picker'
import { getSet } from '@/services/sets'

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
              selectedBooster: z.object<ExtendedBooster['sheets']>(),
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

    const { cards } = picker.pickCards()

    return c.json(
      {
        set,
        selectedBooster: picker.booster!,
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
    const boosters = []
    const totalBoostersWeight = set.boosters.reduce(
      (total, booster) => total + booster.weight,
      0,
    )

    for (const booster of set.boosters) {
      const boosterRate = booster.weight / totalBoostersWeight
      const boosterSheets = []

      for (const sheetName in booster.sheets) {
        const sheetRates = {
          name: sheetName,
          nCardsToPick: booster.sheets[sheetName],
          cards: [],
        } as { name: string, nCardsToPick: number, cards: any[] }
        const sheet = set.sheets[sheetName]!
        const totalCardsWeight = sheet.cards.reduce(
          (total, card) => total + card.weight,
          0,
        )
        for (const card of sheet.cards) {
          const cardRate = card.weight / totalCardsWeight
          sheetRates.cards = [
            ...sheetRates.cards,
            {
              ...card,
              rate: cardRate,
            },
          ]
        }

        sheetRates.cards = sheetRates.cards.sort((a, b) => b.rate - a.rate)

        boosterSheets.push(sheetRates)
      }

      boosters.push({
        sheetsRates: boosterSheets,
        rate: boosterRate,
      })
    }

    return c.json(
      {
        boosters: boosters.sort((a, b) => b.rate - a.rate),
      },
      StatusCodes.OK,
    )
  },
)

export default codeRouter
