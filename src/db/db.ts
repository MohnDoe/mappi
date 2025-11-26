import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema.ts'
import env from '@/env.ts'

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
  },
  schema,
})
