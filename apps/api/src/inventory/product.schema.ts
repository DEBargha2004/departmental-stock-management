import { text } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { category } from './category.schema';
import { timestamp } from 'drizzle-orm/pg-core';

export const product = pgTable('product', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => category.id),

  price: integer('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
