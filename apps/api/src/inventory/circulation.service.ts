import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, Transaction, type TDB } from 'src/database/db.module';
import {
  issueRequest,
  issueRequestItem,
  returnRequest,
  returnRequestItem,
} from './circulation.schema';
import { user } from 'src/user/user.schema';
import { product } from './product.schema';
import { and, count, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { TIssueRequestQuery, TReturnRequestQuery } from '@repo/contracts/query';
import { TJWTPayload } from 'src/authentication/auth.service';
import { gte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { PaginatedListResponse } from 'src/global/types/response';
import {
  TIssueRequest,
  TIssueRequestCreateSchema,
  TIssueRequestItem,
  TIssueRequestUpdateSchema,
  TReturnRequest,
  TReturnRequestCreateSchema,
  TReturnRequestItem,
  TReturnRequestUpdateSchema,
  TUserForCirculation,
} from '@repo/contracts/circulation';
import crypto from 'crypto';
import { ISSUE_REQUEST_RETURN_STATUS } from '@repo/contracts/status';

@Injectable()
export class CirculationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  generateCode() {
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `ISU-${code}`;
  }

  generateIssueReturnStatus(
    totalReturns: number,
    totalDamaged: number,
    issuedQty: number,
  ) {
    if (!totalDamaged) {
      if (totalReturns < issuedQty) {
        if (totalReturns === 0) {
          return ISSUE_REQUEST_RETURN_STATUS.PENDING;
        }
        return ISSUE_REQUEST_RETURN_STATUS.PARTIALLY_RETURNED;
      }
      return ISSUE_REQUEST_RETURN_STATUS.RETURNED;
    }
    return ISSUE_REQUEST_RETURN_STATUS.PARTIALLY_RETURNED;
  }

  async getIssueRequests(
    { query, limit = 20, page = 1 }: TIssueRequestQuery,
    trx?: Transaction,
  ): Promise<PaginatedListResponse<TIssueRequest[]>> {
    const db = trx ?? this.db;

    const issuer = alias(user, 'issuer');
    const receiver = alias(user, 'receiver');

    const baseQuery = db
      .select({
        id: issueRequest.id,
        issueCode: issueRequest.issueCode,
        issueDate: issueRequest.issueDate,
        createdAt: issueRequest.createdAt,
        issuedTo: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${receiver.id}, 
            'name', ${receiver.name}, 
            'email', ${receiver.email},
            'role', ${receiver.role}
        )`.as('issuedTo'),
        issuedBy: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${issuer.id}, 
            'name', ${issuer.name}, 
            'email', ${issuer.email},
            'role', ${issuer.role}
        )`.as('issuedBy'),
        items: sql<TIssueRequestItem[]>`COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${issueRequestItem.id},
                    'quantity', ${issueRequestItem.quantity},
                    'isConsumable', ${issueRequestItem.isConsumable},
                    'returnStatus', ${issueRequestItem.returnStatus},
                    'product', JSON_BUILD_OBJECT(
                        'id', ${product.id},
                        'name', ${product.name}
                    )
                )
            ) FILTER (WHERE ${issueRequestItem.id} IS NOT NULL), '[]'::JSON
        )`.as('items'),
      })
      .from(issueRequest)
      .leftJoin(
        issueRequestItem,
        eq(issueRequest.id, issueRequestItem.issueRequestId),
      )
      .leftJoin(receiver, eq(issueRequest.issuedTo, receiver.id))
      .leftJoin(issuer, eq(issueRequest.issuedBy, issuer.id))
      .leftJoin(product, eq(issueRequestItem.productId, product.id))
      .where(
        and(
          isNull(issueRequest.deletedAt),
          isNull(issueRequestItem.deletedAt),
          ...(query
            ? [
                or(
                  gte(
                    sql`SIMILARITY(${issueRequest.issueCode}, ${query})`,
                    0.3,
                  ),
                  gte(sql`SIMILARITY(${receiver.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${issuer.name}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        query
          ? desc(sql`
                GREATEST(
                SIMILARITY(${issueRequest.issueCode}, ${query}),
                SIMILARITY(${receiver.name}, ${query}),
                SIMILARITY(${issuer.name}, ${query})
                )
            `)
          : desc(issueRequest.createdAt),
      )
      .groupBy(issueRequest.id, receiver.id, issuer.id)
      .as('base_query');

    const selectQuery = db
      .select()
      .from(baseQuery)
      .offset((page - 1) * limit)
      .limit(limit);
    const countQuery = db.select({ count: count() }).from(baseQuery);

    const [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return {
      list,
      count: totalCount,
    };
  }

  async getIssueRequest(id: number, trx?: Transaction) {
    const db = trx ?? this.db;

    const issuer = alias(user, 'issuer');
    const receiver = alias(user, 'receiver');

    const [request] = await db
      .select({
        id: issueRequest.id,
        issueCode: issueRequest.issueCode,
        issueDate: issueRequest.issueDate,
        createdAt: issueRequest.createdAt,
        issuedTo: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${receiver.id}, 
            'name', ${receiver.name}, 
            'email', ${receiver.email},
            'role', ${receiver.role}
        )`.as('issuedTo'),
        issuedBy: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${issuer.id}, 
            'name', ${issuer.name}, 
            'email', ${issuer.email},
            'role', ${issuer.role}
        )`.as('issuedBy'),
        items: sql<TIssueRequestItem[]>`COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${issueRequestItem.id},
                    'quantity', ${issueRequestItem.quantity},
                    'isConsumable', ${issueRequestItem.isConsumable},
                    'returnStatus', ${issueRequestItem.returnStatus},
                    'product', JSON_BUILD_OBJECT(
                        'id', ${product.id},
                        'name', ${product.name}
                    )
                )
            ) FILTER (WHERE ${issueRequestItem.id} IS NOT NULL), '[]'::JSON
        )`.as('items'),
      })
      .from(issueRequest)
      .leftJoin(
        issueRequestItem,
        eq(issueRequest.id, issueRequestItem.issueRequestId),
      )
      .leftJoin(receiver, eq(issueRequest.issuedTo, receiver.id))
      .leftJoin(issuer, eq(issueRequest.issuedBy, issuer.id))
      .leftJoin(product, eq(issueRequestItem.productId, product.id))
      .where(
        and(
          isNull(issueRequest.deletedAt),
          isNull(issueRequestItem.deletedAt),
          eq(issueRequest.id, id),
        ),
      )
      .groupBy(issueRequest.id, receiver.id, issuer.id);

    return request;
  }

  async getReturnRequests(
    { query, limit = 20, page = 1 }: TReturnRequestQuery,
    trx?: Transaction,
  ): Promise<PaginatedListResponse<TReturnRequest[]>> {
    const db = trx ?? this.db;

    const issuer = alias(user, 'issuer');
    const receiver = alias(user, 'receiver');

    const baseQuery = db
      .select({
        id: returnRequest.id,
        issueRequestId: returnRequest.issueRequestId,
        issueCode: issueRequest.issueCode,
        returnDate: returnRequest.returnDate,
        createdAt: returnRequest.createdAt,
        issuedTo: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${receiver.id}, 
            'name', ${receiver.name}, 
            'email', ${receiver.email},
            'role', ${receiver.role}
        )`.as('issuedTo'),
        issuedBy: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${issuer.id}, 
            'name', ${issuer.name}, 
            'email', ${issuer.email},
            'role', ${issuer.role}
        )`.as('issuedBy'),
        items: sql<TReturnRequestItem[]>`COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${returnRequestItem.id},
                    'issueItemId', ${returnRequestItem.issueItemId},
                    'quantityReceived', ${returnRequestItem.quantityReceived},
                    'quantityDamaged', ${returnRequestItem.quantityDamaged},
                    'reason', ${returnRequestItem.reason},
                    'product', JSON_BUILD_OBJECT(
                        'id', ${product.id},
                        'name', ${product.name}
                    )
                )
            ) FILTER (WHERE ${returnRequestItem.id} IS NOT NULL), '[]'::JSON
        )`.as('items'),
      })
      .from(returnRequest)
      .leftJoin(
        returnRequestItem,
        eq(returnRequest.id, returnRequestItem.returnRequestId),
      )
      .leftJoin(
        issueRequestItem,
        eq(issueRequestItem.id, returnRequestItem.issueItemId),
      )
      .leftJoin(issueRequest, eq(returnRequest.issueRequestId, issueRequest.id))
      .leftJoin(product, eq(issueRequestItem.productId, product.id))
      .leftJoin(receiver, eq(issueRequest.issuedTo, receiver.id))
      .leftJoin(issuer, eq(issueRequest.issuedBy, issuer.id))
      .where(
        and(
          isNull(returnRequest.deletedAt),
          isNull(returnRequestItem.deletedAt),
          ...(query
            ? [
                or(
                  gte(
                    sql`SIMILARITY(${issueRequest.issueCode}, ${query})`,
                    0.3,
                  ),
                  gte(sql`SIMILARITY(${receiver.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${issuer.name}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        query
          ? desc(sql`
                GREATEST(
                SIMILARITY(${issueRequest.issueCode}, ${query}),
                SIMILARITY(${receiver.name}, ${query}),
                SIMILARITY(${issuer.name}, ${query})
                )
            `)
          : desc(returnRequest.createdAt),
      )
      .groupBy(returnRequest.id, receiver.id, issuer.id, issueRequest.issueCode)
      .as('base_query');

    const selectQuery = db
      .select()
      .from(baseQuery)
      .offset((page - 1) * limit)
      .limit(limit);
    const countQuery = db.select({ count: count() }).from(baseQuery);

    const [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return {
      list,
      count: totalCount,
    };
  }

  async getReturnRequest(
    id: number,
    trx?: Transaction,
  ): Promise<TReturnRequest | undefined> {
    const db = trx ?? this.db;

    const issuer = alias(user, 'issuer');
    const receiver = alias(user, 'receiver');

    const [request] = await db
      .select({
        id: returnRequest.id,
        issueRequestId: returnRequest.issueRequestId,
        issueCode: issueRequest.issueCode,
        returnDate: returnRequest.returnDate,
        createdAt: returnRequest.createdAt,
        issuedTo: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${receiver.id}, 
            'name', ${receiver.name}, 
            'email', ${receiver.email},
            'role', ${receiver.role}
        )`.as('issuedTo'),
        issuedBy: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${issuer.id}, 
            'name', ${issuer.name}, 
            'email', ${issuer.email},
            'role', ${issuer.role}
        )`.as('issuedBy'),
        items: sql<TReturnRequestItem[]>`COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${returnRequestItem.id},
                    'issueItemId', ${returnRequestItem.issueItemId},
                    'quantityReceived', ${returnRequestItem.quantityReceived},
                    'quantityDamaged', ${returnRequestItem.quantityDamaged},
                    'reason', ${returnRequestItem.reason},
                    'product', JSON_BUILD_OBJECT(
                        'id', ${product.id},
                        'name', ${product.name}
                    )
                )
            ) FILTER (WHERE ${returnRequestItem.id} IS NOT NULL), '[]'::JSON
        )`.as('items'),
      })
      .from(returnRequest)
      .leftJoin(
        returnRequestItem,
        eq(returnRequest.id, returnRequestItem.returnRequestId),
      )
      .leftJoin(
        issueRequestItem,
        eq(issueRequestItem.id, returnRequestItem.issueItemId),
      )
      .leftJoin(issueRequest, eq(returnRequest.issueRequestId, issueRequest.id))
      .leftJoin(product, eq(issueRequestItem.productId, product.id))
      .leftJoin(receiver, eq(issueRequest.issuedTo, receiver.id))
      .leftJoin(issuer, eq(issueRequest.issuedBy, issuer.id))
      .where(
        and(
          isNull(returnRequest.deletedAt),
          isNull(returnRequestItem.deletedAt),
          eq(returnRequest.id, id),
        ),
      )
      .groupBy(
        returnRequest.id,
        receiver.id,
        issuer.id,
        issueRequest.issueCode,
      );

    return request;
  }

  async getReturnRequestByIssueCode(code: string, trx?: Transaction) {
    const db = trx ?? this.db;

    const issuer = alias(user, 'issuer');
    const receiver = alias(user, 'receiver');

    const requests = await db
      .select({
        id: returnRequest.id,
        issueRequestId: returnRequest.issueRequestId,
        returnDate: returnRequest.returnDate,
        createdAt: returnRequest.createdAt,
        issuedTo: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${receiver.id}, 
            'name', ${receiver.name}, 
            'email', ${receiver.email},
            'role', ${receiver.role}
        )`.as('issuedTo'),
        issuedBy: sql<TUserForCirculation>`JSON_BUILD_OBJECT(
            'id', ${issuer.id}, 
            'name', ${issuer.name}, 
            'email', ${issuer.email},
            'role', ${issuer.role}
        )`.as('issuedBy'),
        items: sql<TReturnRequestItem[]>`COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${returnRequestItem.id},
                    'issueItemId', ${returnRequestItem.issueItemId},
                    'quantityReceived', ${returnRequestItem.quantityReceived},
                    'quantityDamaged', ${returnRequestItem.quantityDamaged},
                    'reason', ${returnRequestItem.reason},
                    'product', JSON_BUILD_OBJECT(
                        'id', ${product.id},
                        'name', ${product.name}
                    )
                )
            ) FILTER (WHERE ${returnRequestItem.id} IS NOT NULL), '[]'::JSON
        )`.as('items'),
      })
      .from(returnRequest)
      .leftJoin(
        returnRequestItem,
        eq(returnRequest.id, returnRequestItem.returnRequestId),
      )
      .leftJoin(
        issueRequestItem,
        eq(issueRequestItem.id, returnRequestItem.issueItemId),
      )
      .leftJoin(issueRequest, eq(returnRequest.issueRequestId, issueRequest.id))
      .leftJoin(product, eq(issueRequestItem.productId, product.id))
      .leftJoin(receiver, eq(issueRequest.issuedTo, receiver.id))
      .leftJoin(issuer, eq(issueRequest.issuedBy, issuer.id))
      .where(
        and(
          isNull(returnRequest.deletedAt),
          isNull(returnRequestItem.deletedAt),
          eq(issueRequest.issueCode, code),
        ),
      )
      .groupBy(returnRequest.id, receiver.id, issuer.id);

    return requests;
  }

  async createIssueRequest(
    data: TIssueRequestCreateSchema,
    consumables: number[],
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    const issue = await db.transaction(async (tx) => {
      const issueCode = this.generateCode();
      const [issue] = await tx
        .insert(issueRequest)
        .values({
          issueCode,
          issueDate: data.issueDate,
          issuedTo: data.userId,
          issuedBy: user.id,
        })
        .returning();

      await Promise.all(
        data.items.map((item) =>
          tx.insert(issueRequestItem).values({
            issueRequestId: issue.id,
            productId: item.itemId,
            quantity: item.quantity,
            isConsumable: consumables.includes(item.itemId),
            returnStatus: consumables.includes(item.itemId)
              ? ISSUE_REQUEST_RETURN_STATUS.NON_RETURNABLE
              : ISSUE_REQUEST_RETURN_STATUS.PENDING,
          }),
        ),
      );

      return issue;
    });

    return issue;
  }

  async updateIssueRequest(
    id: number,
    data: TIssueRequestUpdateSchema,
    consumables: number[],
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const request = await this.getIssueRequest(id, tx);

      // delete existing items
      await tx
        .update(issueRequestItem)
        .set({
          deletedAt: new Date(),
        })
        .where(
          inArray(
            issueRequestItem.id,
            request.items.map((item) => item.id),
          ),
        );

      // add new items
      await tx.insert(issueRequestItem).values(
        data.items.map((it) => ({
          issueRequestId: id,
          productId: it.itemId,
          quantity: it.quantity,
          isConsumable: consumables.includes(it.itemId),
          returnStatus: consumables.includes(it.itemId)
            ? ISSUE_REQUEST_RETURN_STATUS.NON_RETURNABLE
            : ISSUE_REQUEST_RETURN_STATUS.PENDING,
        })),
      );

      await tx
        .update(issueRequest)
        .set({
          issueDate: data.issueDate,
          issuedTo: data.userId,
          issuedBy: user.id,
        })
        .where(eq(issueRequest.id, id));
    });
  }

  async updateIssueRequestItemStatus(
    list: { id: number; status: ISSUE_REQUEST_RETURN_STATUS }[],
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const values = list.map(
        (it) => sql`(
          ${it.id}::integer,
          ${it.status}
        )`,
      );

      await tx.execute(sql`
        UPDATE ${issueRequestItem}
        SET
          ${sql.raw(issueRequestItem.returnStatus.name)} = v.return_status
        FROM (
          VALUES ${sql.join(values, sql`, `)} 
        ) AS v(id, return_status)
        WHERE ${issueRequestItem.id} = v.id
        `);
    });
  }

  async deleteIssueRequest(id: number, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const request = await this.getIssueRequest(id, tx);

      await tx
        .update(issueRequestItem)
        .set({
          deletedAt: new Date(),
        })
        .where(
          inArray(
            issueRequestItem.id,
            request.items.map((item) => item.id),
          ),
        );
      await tx
        .update(issueRequest)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(issueRequest.id, id));
    });
  }

  async createReturnRequest(
    data: TReturnRequestCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    const ret = await db.transaction(async (tx) => {
      const [ret] = await tx
        .insert(returnRequest)
        .values({
          issueRequestId: data.issueRequestId,
          returnDate: data.returnDate,
          issuerId: user.id,
        })
        .returning();

      await tx.insert(returnRequestItem).values(
        data.items.map((item) => ({
          returnRequestId: ret.id,
          issueItemId: item.issueItemId,
          quantityReceived: item.quantityReceived,
          quantityDamaged: item.quantityDamaged,
          reason: item.reason,
        })),
      );

      return ret;
    });

    return ret;
  }

  async updateReturnRequest(
    id: number,
    data: TReturnRequestUpdateSchema,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    const ret = await db.transaction(async (tx) => {
      const [ret] = await tx
        .update(returnRequest)
        .set({
          returnDate: data.returnDate,
          issueRequestId: data.issueRequestId,
        })
        .where(eq(returnRequest.id, id))
        .returning();

      await tx
        .update(returnRequestItem)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(returnRequestItem.returnRequestId, ret.id));

      await tx.insert(returnRequestItem).values(
        data.items.map((item) => ({
          returnRequestId: ret.id,
          issueItemId: item.issueItemId,
          quantityReceived: item.quantityReceived,
          quantityDamaged: item.quantityDamaged,
          reason: item.reason,
        })),
      );
    });

    return ret;
  }

  async deleteReturnRequest(id: number, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      await tx
        .update(returnRequest)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(returnRequest.id, id));

      await tx
        .update(returnRequestItem)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(returnRequestItem.returnRequestId, id));
    });
  }
}
