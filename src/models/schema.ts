import {
  pgTable,
  serial,
  text,
  varchar,
  decimal,
  boolean,
  timestamp,
  integer,
  primaryKey
} from 'drizzle-orm/pg-core'

// 🟢 CATEGORIES TABLE
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
})

// 🟢 PRODUCTS TABLE
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sku: varchar('sku', { length: 100 }).unique(),
  wholesalePrice: decimal('wholesale_price', {
    precision: 10,
    scale: 2
  }).notNull(),
  retailPrice: decimal('retail_price', { precision: 10, scale: 2 }).notNull(),
  taxPercentage: decimal('tax_percentage', {
    precision: 5,
    scale: 2
  }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
})

// 🟢 PRODUCT CATEGORIES RELATIONSHIP TABLE
export const productCategories = pgTable(
  'product_categories',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' })
  },
  table => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] })
  })
)
