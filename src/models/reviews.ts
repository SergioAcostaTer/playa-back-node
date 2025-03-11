import {
  pgTable,
  serial,
  integer,
  timestamp,
  text
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { beaches } from './beaches'

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  beachId: integer('beach_id')
    .references(() => beaches.id)
    .notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
