import { drizzle } from 'drizzle-orm/postgres-js'
import { Pool } from 'pg'
import * as schema from '@/db/schema.ts'
import env from '@/env.ts'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
})

export const db = drizzle(pool, { schema, casing: 'snake_case' })
