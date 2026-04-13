import { text } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { category } from './category.schema';
import { boolean } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const item = pgTable(
  'item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    categoryId: integer('category_id')
      .notNull()
      .references(() => category.id),

    isActive: boolean('is_active').notNull().default(true),
    minStockLevel: integer('min_stock_level'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [check('min_stock_level_check', sql`${table.minStockLevel} > 0`)],
);
