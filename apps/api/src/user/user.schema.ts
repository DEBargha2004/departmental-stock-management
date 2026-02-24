import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
