import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { date } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { vendor } from 'src/database/schema';
import { user } from 'src/user/user.schema';
import type { PO_STATUS } from '@repo/contracts/status';
import { item } from './item.schema';

// stock procurement detail
export const purchaseOrder = pgTable('purchase_order', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: text('invoice_id').notNull(),
  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendor.id),

  status: text('status').$type<PO_STATUS>().notNull(),
  totalAmount: integer('total_amount').notNull(),
  orderDate: date('order_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderId: integer('purchase_order_id')
    .notNull()
    .references(() => purchaseOrder.id),

  itemId: integer('item_id')
    .notNull()
    .references(() => item.id),

  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const issueItem = pgTable(
  'issue_item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer('item_id')
      .notNull()
      .references(() => item.id),
    quantity: integer('quantity').notNull(),
    issuedBy: integer('issued_by')
      .notNull()
      .references(() => user.id),

    issuedTo: integer('issued_to')
      .notNull()
      .references(() => user.id),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('issue_item_quantity_check', sql`${issueItem.quantity} > 0`),
  ],
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
    check(
      'return_item_quantity_check',
      sql`${returnItem.quantityReceived} > 0`,
    ),
  ],
);

export * from './category.schema';
export * from './item.schema';
export * from './stock.schema';
