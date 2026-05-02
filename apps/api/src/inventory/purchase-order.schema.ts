import { product, vendor } from 'src/database/schema';
import {
  check,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { PURCHASE_ORDER_STATUS } from '@repo/contracts/status';

// stock procurement detail
export const purchaseOrder = pgTable('purchase_order', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: text('invoice_id').notNull(),
  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendor.id),

  totalAmount: integer('total_amount').notNull(),
  status: text('status')
    .$type<PURCHASE_ORDER_STATUS>()
    .notNull()
    .default('ordered'),
  orderDate: timestamp('order_date', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderId: integer('purchase_order_id')
    .notNull()
    .references(() => purchaseOrder.id),

  productId: integer('product_id')
    .notNull()
    .references(() => product.id),

  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const stockBatch = pgTable('stock_batch', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderId: integer('purchase_order_id')
    .notNull()
    .references(() => purchaseOrder.id),
  batchNumber: text('batch_number').notNull(),
  arrivalDate: timestamp('arrival_date', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const stockBatchItems = pgTable(
  'stock_batch_items',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    batchId: integer('batch_id')
      .notNull()
      .references(() => stockBatch.id),
    purchaseOrderItemId: integer('purchase_order_item_id')
      .notNull()
      .references(() => purchaseOrderItems.id),

    quantityReceived: integer('quantity_received').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('stock_batch_quantity_check', sql`${table.quantityReceived} > 0`),
  ],
);
