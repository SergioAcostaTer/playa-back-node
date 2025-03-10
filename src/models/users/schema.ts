import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer
} from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description').notNull()
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id)
    .default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
})
