import type { SealedExtendedData } from '@/models/taw.types'
import { mkdir } from 'node:fs/promises'
import pino from 'pino'
import PinoPretty from 'pino-pretty'

const GITHUB_REPO = 'taw/magic-sealed-data'
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/master`
const GITHUB_RAW_DATA_BASIC_URL = `${GITHUB_RAW_URL}/sealed_basic_data.json`
const CACHE_DATA_DIR = './tmp/magic-sealed-data'
const CACHE_DATA_BASIC_FILE = `${CACHE_DATA_DIR}/sealed_basic_data.json`

const logger = pino({
  level: 'debug',
}, PinoPretty())

async function main() {
  const sealedData = await getSealedData() as SealedExtendedData

  const setCount = sealedData.length
  logger.info(`Loaded ${setCount} sets`)

  let i = 0
  for (const { code, boosters: variants, sheets } of sealedData) {
    i++
    const progress = ((i / setCount) * 100).toFixed(2)
    logger.info(`[${progress}%] Importing set "${code}"`)

    const totalVariantsWeight = variants.reduce((total, { weight }) => total + weight, 0)

    const variantLogger = logger.child({ variant: code })
    variantLogger.info(`Total weight: ${totalVariantsWeight}`)
    for (const [sheetName, { balance_colors: balanceColors = false, cards, total_weight: totalWeight }] of Object.entries(sheets)) {
      const sheetLogger = variantLogger.child({ sheet: sheetName })
      sheetLogger.info(`Total weight: ${totalWeight}, cards: ${Object.entries(cards).length}`)

      for (const [cardCode, weight] of Object.entries(cards)) {
        // const cardLogger = sheetLogger.child({ card: cardCode })
        // do card
      }
    }
  }
}

async function downloadSealedDataFromGithub(): Promise<SealedExtendedData> {
  const url = GITHUB_RAW_DATA_BASIC_URL
  logger.info(`Downloading sealed data : ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download sealed data from ${url}`)
  }

  return response.json() as unknown as SealedExtendedData
}

async function getSealedData(): Promise<SealedExtendedData> {
  const cachedFile = Bun.file(CACHE_DATA_BASIC_FILE)

  const exists = await cachedFile.exists()

  if (exists) {
    logger.info(`Loading sealed data from cache`)
    return await cachedFile.json()
  }

  const content = await downloadSealedDataFromGithub()

  await mkdir(CACHE_DATA_DIR, { recursive: true })

  await Bun.write(CACHE_DATA_BASIC_FILE, JSON.stringify(content))
  logger.info(`Saving sealed data to cache`)

  return content
}

main()
