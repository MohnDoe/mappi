export type SealedExtendedData = ExtendedSet[]

export interface ExtendedSet {
  name: string
  code: string
  set_code: string
  boosters: ExtendedBooster[]
  sheets: Record<string, ExtendedSheet>
  source_set_codes: string[]
}

export interface ExtendedBooster {
  sheets: Record<string, number>
  weight: number
}

export interface ExtendedSheet {
  total_weight: number
  balance_colors?: boolean
  cards: ExtendedCard[]
}

export interface ExtendedCard {
  set: string
  number: string
  weight: number
  foil: boolean
  uuid: string
}
