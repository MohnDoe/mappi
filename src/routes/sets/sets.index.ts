import type { ExtendedBooster, ExtendedCard, ExtendedSet } from '@/models/taw.types'
import { createRoute, z } from '@hono/zod-openapi'
import { createRouter } from '@/lib/create-app'
import notFound from '@/middlewares/not-found'
import { Picker } from '@/services/picker'
import { getSet, listSets } from '@/services/sets'

const router = createRouter()

router.openapi(createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
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
}), (c) => {
  return c.json({
    sets: listSets(),
  }, 200)
})

router.openapi(
  createRoute({
    method: 'get',
    path: '/:code/open',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              set: z.object<ExtendedSet>(),
              selectedBooster: z.object<ExtendedBooster['sheets']>(),
              cardsPerSheet: z.number(),
              cards: z.array(z.object<ExtendedCard>()),
              seed: z.string(),
              date: z.date(),
            }),
          },
        },
        description: 'Simulate opening a set',
      },
      404: {
        description: 'Set not found',
      },
    },
  }),
  (c) => {
    const { code } = c.req.param()
    const set = getSet(code)
    if (!set) {
      return notFound(c)
    }

    const picker = new Picker(set)

    picker.pickBooster()

    const { cardsPerSheet, cards } = picker.pickCards()

    return c.json({
      set,
      selectedBooster: picker.booster!,
      cardsPerSheet,
      cards,
      seed: picker._seed,
      date: new Date(),
    })
  },
)

router.openapi(
  createRoute({
    method: 'get',
    path: '/:code/rates',
    responses: {
      200: {
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
    const { code } = c.req.param()
    const set = getSet(code)

    if (!set)
      return c.json({ message: 'No set' })

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

    return c.json({
      boosters: boosters.sort((a, b) => b.rate - a.rate),
    })
  },
)

export default router
