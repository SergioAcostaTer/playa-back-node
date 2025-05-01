import {
  integer,
  pgTable,
  serial,
  timestamp,
  unique
} from 'drizzle-orm/pg-core'
import { beaches } from './beaches'
import { users } from './users'

export const favourites = pgTable(
  'favourites',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    beachId: integer('beach_id')
      .references(() => beaches.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  t => [unique().on(t.userId, t.beachId)]
)
