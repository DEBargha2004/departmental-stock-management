import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { item } from './item.schema';
import { timestamp } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { MOVEMENT_TYPE } from '@repo/contracts/status';
import { purchaseOrderItems } from './inventory.schema';

export const stock = pgTable('stock', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer('item_id')
    .notNull()
    .references(() => item.id),

  // need to add more cols
  quantityAvailable: integer('quantity_available').notNull().default(0),
  quantityIssued: integer('quantity_issued').notNull().default(0),
  quantityDamaged: integer('quantity_damaged').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// stocky movement history
export const stockMovement = pgTable('stock_movement', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer('item_id')
    .notNull()
    .references(() => item.id),

  movementType: text('movement_type').$type<MOVEMENT_TYPE>().notNull(),
  quantity: integer('quantity').notNull(),
  reference: text('reference'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const stockBatch = pgTable('stock_batch', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderItemId: integer('purchase_order_item_id')
    .notNull()
    .references(() => purchaseOrderItems.id),

  quantityReceived: integer('quantity_received').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
