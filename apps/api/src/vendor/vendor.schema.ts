import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const vendor = pgTable('vendor', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
