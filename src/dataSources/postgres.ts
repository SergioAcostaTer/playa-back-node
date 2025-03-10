import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const {
  PG_USER = 'terencio_owner',
  PG_HOST = 'localhost',
  PG_DATABASE = 'terencio',
  PG_PASSWORD = 'tolete123',
  PG_PORT = '5432',
  NODE_ENV
} = process.env

const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: Number(PG_PORT),
  ssl: {
    rejectUnauthorized: NODE_ENV === 'production'
  }
})

export const postgres = drizzle(pool)
