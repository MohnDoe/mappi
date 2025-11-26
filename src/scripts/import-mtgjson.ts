import type * as MTGJSON from '@/models/mtgjson.types'
import { mkdir } from 'node:fs/promises'
import { createZipReader } from '@holmlibs/unzip'
import { semver } from 'bun'
import pino from 'pino'
import PinoPretty from 'pino-pretty'

const MTGJSON_URL = 'https://mtgjson.com/api/v5'
const MTGJSON_ZIP_FILE_URL = `${MTGJSON_URL}/AllSetFiles.zip`
const MTGJSON_META_FILE_URL = `${MTGJSON_URL}/Meta.json`

const CACHE_DIR = './tmp/mtgjson-data'
const CACHE_EXTRACT_DIR = `${CACHE_DIR}/SetsFiles`
const CACHE_ZIP_FILE = `${CACHE_DIR}/AllSetFiles.zip`

const LOCAL_MTGJSON_DATA_DIR = `./data/MTGJSON`
const LOCAL_MTGJSON_VERSION_FILE = `${LOCAL_MTGJSON_DATA_DIR}/version.json`

const logger = pino({
  level: 'debug',
}, PinoPretty())

async function main() {
  const needUpdate = await shouldUpdate()

  if (needUpdate) {
    const remoteMeta = await getRemoteMTGJSONVersion()
    await getAllSetsZip()

    await unzipAllSetsFiles()
    await deleteAllSetsZipFile()

    await saveLocalVersion(remoteMeta)
  }
  else {
    logger.info('No new version found, skipping download')
  }
}

async function unzipAllSetsFiles() {
  const reader = createZipReader(CACHE_ZIP_FILE)

  await reader.extractAll(CACHE_EXTRACT_DIR, (current, total) => {
    logger.info(`Extracting: ${current}/${total} files`)
  })
}

async function deleteAllSetsZipFile() {
  logger.debug(`Deleting: ${CACHE_ZIP_FILE}`)
  await Bun.file(CACHE_ZIP_FILE).delete()
}

async function downloadZipFromRemote() {
  logger.info(`Downloading ZIP from MTGJSON`)
  const url = MTGJSON_ZIP_FILE_URL

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download sealed data from ${url}`)
  }

  logger.info(`Download. Success!`)

  return response.arrayBuffer()
}

async function getAllSetsZip() {
  const cachedFile = Bun.file(CACHE_ZIP_FILE)
  const exists = await cachedFile.exists()

  if (exists) {
    logger.info(`Loading sets from cached ZIP`)
    return
  }

  const content = await downloadZipFromRemote()

  await mkdir(CACHE_DIR, { recursive: true })

  await Bun.write(CACHE_ZIP_FILE, content)
  logger.info(`Saved sets ZIP to cache`)
}

async function getRemoteMTGJSONVersion(): Promise<MTGJSON.Meta> {
  const url = MTGJSON_META_FILE_URL

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed fetching current MTJJSON version (${url})`)
  }

  const metaFileContent = await response.json() as {
    data: MTGJSON.Meta
  }

  return (metaFileContent.data) as MTGJSON.Meta
}

async function getLocalMTGJSONVersion(): Promise<MTGJSON.Meta | null> {
  const versionFile = Bun.file(LOCAL_MTGJSON_VERSION_FILE)
  const exists = await versionFile.exists()

  if (!exists) {
    return null
  }

  return (await versionFile.json() as MTGJSON.Meta)
}

async function shouldUpdate() {
  const localVersion = await getLocalMTGJSONVersion()

  if (!localVersion)
    return true

  logger.debug(`Local MTGJSON version ${localVersion.version}::${localVersion.date}`)
  const remoteVersion = await getRemoteMTGJSONVersion()

  if (!remoteVersion)
    return true

  logger.debug(`Remote MTGJSON version ${remoteVersion.version}::${remoteVersion.date}`)

  try {
    return semver.order(localVersion.version, remoteVersion.version) === 1
  }
  catch (error) {
    logger.error(`Error while checking MTGJSON version : ${error}`)
    return true
  }
}

async function saveLocalVersion(meta: MTGJSON.Meta) {
  await mkdir(LOCAL_MTGJSON_DATA_DIR, { recursive: true })
  await Bun.write(LOCAL_MTGJSON_VERSION_FILE, JSON.stringify(meta))
}

main()
