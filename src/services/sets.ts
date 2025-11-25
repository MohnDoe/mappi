import type { ExtendedCard, ExtendedSet, SealedExtendedData } from '@/models/taw.types'
import sealedData from '@/data/sealedExtendedData'

export function listSets() {
  return sealedData as SealedExtendedData
}

export function getSet(code: string) {
  return listSets().find(set => set.code === code)
}

export function getSetRates(set: ExtendedSet) {
  const boosters = []
  const totalBoostersWeight = set.boosters.reduce(
    (total, booster) => total + booster.weight,
    0,
  )

  const allCards: Record<string, typeof set.sheets[string]['cards'][number] & {
    packRate: number
    localRate: number
  }> = {}

  for (const booster of set.boosters) {
    if (!booster.sheets)
      return
    const boosterRate = booster.weight / totalBoostersWeight
    const boosterSheets = []
    const totalCardsInPack = Object.values(booster.sheets).reduce((total, n) => total + n, 0)

    for (const sheetName in booster.sheets) {
      const nCardsToPickInSheet = booster.sheets[sheetName]!
      const sheet = set.sheets[sheetName]!
      const totalCardsWeight = sheet.cards.reduce(
        (total, card) => total + card.weight,
        0,
      )

      const sheetRates: {
        name: string
        nCardsToPick: number
        cards: Array<ExtendedCard & {
          localRate: number
          packRate: number
        }>
      } = {
        name: sheetName,
        nCardsToPick: nCardsToPickInSheet,
        cards: [],
      }
      for (const card of sheet.cards) {
        const cardKey = `${card.set}-${card.number}`

        const localRate = card.weight / totalCardsWeight
        const packRate = boosterRate * (nCardsToPickInSheet / totalCardsInPack) * localRate
        sheetRates.cards.push({
          ...card,
          localRate,
          packRate,
        })

        if (allCards[cardKey]) {
          allCards[cardKey].packRate += packRate
        }
        else {
          allCards[cardKey] = {
            ...card,
            localRate,
            packRate,
          }
        }
      }

      sheetRates.cards = sheetRates.cards.sort((a, b) => b.localRate - a.localRate)

      boosterSheets.push(sheetRates)
    }

    boosters.push({
      sheetsRates: boosterSheets,
      rate: boosterRate,
    })
  }

  return {
    boosters,
    cards: Object.values(allCards).sort((a, b) => b.packRate - a.packRate),
  }
}
