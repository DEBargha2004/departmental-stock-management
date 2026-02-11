import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export type ROLE = 'SUPER-ADMIN' | 'ADMIN' | 'STAFF' | 'STUDENT';
export type STATUS = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export const user = pgTable('user', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const role = pgTable('role', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: text('code').$type<ROLE>().notNull(),
});

export const userRole = pgTable(
  'user_role',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => user.id),

    roleId: integer('role_id')
      .notNull()
      .references(() => role.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const permission = pgTable('permission', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: text('code').notNull(),
});

export const rolePermission = pgTable(
  'role_permission',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => role.id),

    permissionId: integer('permission_id')
      .notNull()
      .references(() => permission.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),

  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const vendor = pgTable('vendor', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const department = pgTable('department', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: text('code').notNull(),
  name: text('department').notNull(),
  status: text('status').$type<STATUS>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

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
    categoryId: integer('category_id')
      .notNull()
      .references(() => category.id),

    status: text('status')
      .$type<STATUS>()
      .notNull()
      .default(sql`DRAFT`),

    minStockLevel: integer('min_stock_level'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [check('min_stock_level', sql`${table.minStockLevel} >= 0`)],
);

export type LOCATION_TYPE = 'STORE' | 'LAB' | 'CLASSROOM' | 'OTHER';

export const location = pgTable('location', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  type: text('type').$type<LOCATION_TYPE>().notNull(),
  status: text('status').$type<STATUS>().notNull(),
  parentLocationId: integer('parent_location_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// snapshot of stock
export const stock = pgTable(
  'stock',
  {
    itemId: integer('item_id')
      .notNull()
      .references(() => item.id),

    locationId: integer('location_id')
      .notNull()
      .references(() => location.id),

    // need to add more cols

    quantityAvailable: integer('quantity_available').notNull().default(0),
    quantityIssued: integer('quantity_issued').notNull().default(0),
    quantityDamaged: integer('quantity_damaged').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.locationId] })],
);

export type MOVEMENT_TYPE = 'ISSUE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';

// stocky movement history
export const stockMovement = pgTable('stock_movement', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer('item_id')
    .notNull()
    .references(() => item.id),

  locationId: integer('location_id')
    .notNull()
    .references(() => location.id),

  movementType: text('movement_type').$type<MOVEMENT_TYPE>().notNull(),
  quantity: integer('quantity').notNull(),
  reference: text('reference'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// stock procurement detail
export const stockBatch = pgTable('stock_batch', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer('item_id')
    .notNull()
    .references(() => item.id),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendor.id),

  quantityReceived: integer('quantity_received').notNull(),
  purchaseDate: timestamp('purchase_date').notNull(),
  invoiceNo: text('invoice_no').notNull(),
  expiryWarranty: timestamp('expiry_warranty'),
});
