import {
  pgTable,
  serial,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  loginAt: timestamp('login_at').defaultNow().notNull()
})
