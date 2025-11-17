import type { SealedExtendedData } from '@/models/taw.types'
import sealedData from '@/data/sealedExtendedData'

export function listBoosters() {
  return sealedData as SealedExtendedData
}

export function getSet(code: string) {
  return listBoosters().find(booster => booster.code === code)
}
