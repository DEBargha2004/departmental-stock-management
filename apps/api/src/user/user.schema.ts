import { Role } from '@repo/contracts/roles';
import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const user = pgTable(
  'user',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: jsonb('role').$type<Role>().notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('user_email_unique_active_idx')
      .on(table.email)
      .where(sql`${table.isActive} = TRUE OR ${table.deletedAt} IS NULL`),
  ],
);
