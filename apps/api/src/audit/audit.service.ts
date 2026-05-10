import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, Transaction, type TDB } from 'src/database/db.module';
import { auditLog, TDBAuditLog } from './audit.schema';
import { TAuditLogQuery } from '@repo/contracts/query';
import { user } from 'src/user/user.schema';
import { and, count, desc, eq, gte, or, sql } from 'drizzle-orm';
import type { TAuditLog } from '@repo/contracts/audit';

type TUser = {
  id: number;
  name: string;
  email: string;
};
@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE_MODULE) private readonly db: TDB) {}

  async logAction(payload: TDBAuditLog, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.insert(auditLog).values(payload);
  }

  async getAuditLogs(
    { page = 1, limit = 20, action, entity, query }: TAuditLogQuery,
    trx?: Transaction,
  ): Promise<{ list: TAuditLog[]; count: number }> {
    const db = trx ?? this.db;
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        description: auditLog.description,
        createdAt: auditLog.createdAt,
        user: sql<TUser>`JSON_BUILD_OBJECT(
          'id', ${user.id},
          'name', ${user.name},
          'email', ${user.email}
        )`.as('user'),
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .where(
        and(
          ...(action ? [eq(auditLog.action, action)] : []),
          ...(entity ? [eq(auditLog.entityType, entity)] : []),
          ...(query
            ? [
                or(
                  gte(sql`SIMILARITY(${auditLog.description}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${user.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${user.email}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        query
          ? desc(sql`
            GREATEST(
              SIMILARITY(${auditLog.description}, ${query}),
              SIMILARITY(${user.name}, ${query}),
              SIMILARITY(${user.email}, ${query})
            )`)
          : desc(auditLog.createdAt),
      )
      .as('base_query');

    const selectQuery = db.select().from(baseQuery).limit(limit).offset(offset);
    const countQuery = db.select({ count: count() }).from(baseQuery);

    const [logs, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return { list: logs as unknown as TAuditLog[], count: totalCount };
  }
}
