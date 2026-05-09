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
import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm';
import {
  TIssueRequestCreateSchema,
  TIssueRequestUpdateSchema,
} from '@repo/contracts/issue-request';
import {
  TReturnRequestCreateSchema,
  TReturnRequestUpdateSchema,
} from '@repo/contracts/return-request';
import { TIssueRequestQuery, TReturnRequestQuery } from '@repo/contracts/query';
import { TJWTPayload } from 'src/authentication/auth.service';
import { gte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { PaginatedListResponse } from 'src/global/types/response';

export type TUserForCirculation = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type TProductForCirculation = {
  id: number;
  name: string;
};

export type TIssueRequestItem = {
  id: number;
  quantity: number;
  isConsumable: boolean;
  product: TProductForCirculation;
};

export type TIssueRequest = {
  id: number;
  issueCode: string;
  issueDate: Date;
  issuedBy: TUserForCirculation;
  issuedTo: TUserForCirculation;
  createdAt: Date;
  items: TIssueRequestItem[];
};

export type TReturnRequestItem = {
  id: number;
  quantityReceived: number;
  quantityDamaged: number;
  reason: string | null;
  product: TProductForCirculation;
};

export type TReturnRequest = {
  id: number;
  issueRequestId: number;
  returnDate: Date;
  createdAt: Date;
  items: TReturnRequestItem[];
};

@Injectable()
export class CirculationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

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
      .groupBy(issueRequest.id)
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
      .groupBy(returnRequest.id)
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

  async getReturnRequest(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
  }

  async createIssueRequest(
    data: TIssueRequestCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    // Boilerplate for createIssueRequest
  }

  async updateIssueRequest(
    id: number,
    data: TIssueRequestUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    // Boilerplate for updateIssueRequest
  }

  async deleteIssueRequest(id: number, user: TJWTPayload, trx?: Transaction) {
    // Boilerplate for deleteIssueRequest
  }

  async createReturnRequest(
    data: TReturnRequestCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    // Boilerplate for createReturnRequest
  }

  async updateReturnRequest(
    id: number,
    data: TReturnRequestUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    // Boilerplate for updateReturnRequest
  }

  async deleteReturnRequest(id: number, user: TJWTPayload, trx?: Transaction) {
    // Boilerplate for deleteReturnRequest
  }
}
