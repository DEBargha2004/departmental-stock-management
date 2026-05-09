import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';
import type { MOVEMENT_TYPE } from '@repo/contracts/status';
import { product } from './product.schema';
import { boolean } from 'drizzle-orm/pg-core';

export const stock = pgTable(
  'stock',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => product.id),

    minStockLevel: integer('min_stock_level').notNull().default(0),
    quantityAvailable: integer('quantity_available').notNull().default(0),
    quantityIssued: integer('quantity_issued').notNull().default(0),
    quantityDamaged: integer('quantity_damaged').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [check('min_stock_level_check', sql`${table.minStockLevel} > 0`)],
);

// stocky movement history
export const stockMovement = pgTable('stock_movement', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  productId: integer('product_id')
    .notNull()
    .references(() => product.id),

  movementType: text('movement_type').$type<MOVEMENT_TYPE>().notNull(),
  quantity: integer('quantity').notNull(),
  reference: text('reference'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type TDBStockMovement = typeof stockMovement.$inferInsert;
export type TDBStock = typeof stock.$inferInsert;

export * from './circulation.schema';
export * from './category.schema';
export * from './product.schema';
export * from './purchase-order.schema';
