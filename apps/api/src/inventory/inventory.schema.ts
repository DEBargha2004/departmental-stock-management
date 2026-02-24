import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { date } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { vendor } from 'src/database/schema';
import { user } from 'src/user/user.schema';

export type STATUS = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type MOVEMENT_TYPE = 'ISSUE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';
export type PO_STATUS = 'DRAFT' | 'APPROVED' | 'RECEIVED';

// Inventory
export const category = pgTable('category', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const item = pgTable(
  'item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    categoryId: integer('category_id')
      .notNull()
      .references(() => category.id),

    status: text('status').$type<STATUS>().notNull().default('DRAFT'),

    minStockLevel: integer('min_stock_level'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [check('min_stock_level_check', sql`${item.minStockLevel} > 0`)],
);

// snapshot of stock
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

export const stockBatch = pgTable('stock_batch', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderItemId: integer('purchase_order_item_id')
    .notNull()
    .references(() => purchaseOrderItems.id),

  quantityReceived: integer('quantity_received').notNull(),
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
