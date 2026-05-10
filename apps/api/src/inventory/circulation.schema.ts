import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';
import { product } from './product.schema';
import { boolean } from 'drizzle-orm/pg-core';
import { check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const issueRequest = pgTable('issue_request', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  issueCode: text('issue_code').notNull(),
  issuedBy: integer('issued_by')
    .notNull()
    .references(() => user.id),

  issuedTo: integer('issued_to')
    .notNull()
    .references(() => user.id),
  issueDate: timestamp('issue_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const issueRequestItem = pgTable(
  'issue_request_item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    issueRequestId: integer('issue_request_id')
      .notNull()
      .references(() => issueRequest.id),
    productId: integer('product_id')
      .notNull()
      .references(() => product.id),

    isConsumable: boolean('is_consumable').default(false),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [check('issue_item_quantity_check', sql`${table.quantity} > 0`)],
);

export const returnRequest = pgTable('return_request', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  issueRequestId: integer('issue_request_id')
    .notNull()
    .references(() => issueRequest.id),
  issuerId: integer('issuer_id')
    .notNull()
    .references(() => user.id),
  returnDate: timestamp('return_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const returnRequestItem = pgTable(
  'return_request_item',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    returnRequestId: integer('return_request_id')
      .notNull()
      .references(() => returnRequest.id),
    issueItemId: integer('issue_item_id')
      .notNull()
      .references(() => issueRequestItem.id),

    quantityReceived: integer('quantity_received').notNull(),
    quantityDamaged: integer('quantity_damaged').default(0),
    reason: text('reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    check('return_item_quantity_check', sql`${table.quantityReceived} > 0`),
    check('return_item_damaged_check', sql`${table.quantityDamaged} >= 0`),
  ],
);
