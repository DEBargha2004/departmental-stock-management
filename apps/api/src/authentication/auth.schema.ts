import { integer } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';

export const credentials = pgTable('credentials', {
  id: integer('id').notNull().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const resetPasswordToken = pgTable('reset_password_token', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  tokenHash: text('token_hash').notNull(),
  expiredAt: timestamp('expired_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
