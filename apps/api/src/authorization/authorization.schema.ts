import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { primaryKey } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';

export type ROLE = 'ADMIN' | 'STAFF' | 'STUDENT';

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
    deletedAt: timestamp('deleted_at'),
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
