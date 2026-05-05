import type {
  ACTOR_TYPE,
  AUDIT_ACTION,
  ENTITY_TYPE,
} from '@repo/contracts/status';
import { integer } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { user } from 'src/user/user.schema';

export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').references(() => user.id),
  action: text('action').$type<AUDIT_ACTION>().notNull(),
  actorType: text('actor_type').$type<ACTOR_TYPE>().default('user'),
  description: text('description'),
  entityType: text('entity_type').$type<ENTITY_TYPE>().notNull(),
  entityId: integer('entity_id'),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type TDBAuditLog = typeof auditLog.$inferInsert;
