import type { SealedExtendedData } from '@/models/taw.types'
import sealedData from '@/data/sealedExtendedData'

export function listSets() {
  return sealedData as SealedExtendedData
}

export function getSet(code: string) {
  return listSets().find(set => set.code === code)
}
