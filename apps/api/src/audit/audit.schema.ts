import { integer } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';

export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),

  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
