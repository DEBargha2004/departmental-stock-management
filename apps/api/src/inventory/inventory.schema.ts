import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';
import type { MOVEMENT_TYPE } from '@repo/contracts/status';
import { product } from './product.schema';

export const issueItem = pgTable(
  'issue_item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => product.id),
    quantity: integer('quantity').notNull(),
    issuedBy: integer('issued_by')
      .notNull()
      .references(() => user.id),

    issuedTo: integer('issued_to')
      .notNull()
      .references(() => user.id),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [check('issue_item_quantity_check', sql`${table.quantity} > 0`)],
);

export const returnItem = pgTable(
  'return_item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    issueItemId: integer('issue_item_id')
      .notNull()
      .references(() => issueItem.id),

    quantityReceived: integer('quantity_received').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('return_item_quantity_check', sql`${table.quantityReceived} > 0`),
  ],
);

export const stock = pgTable(
  'stock',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => product.id),

    minStockLevel: integer('min_stock_level'),
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

export * from './category.schema';
export * from './product.schema';
export * from './purchase-order.schema';
