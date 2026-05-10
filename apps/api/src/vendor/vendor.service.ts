import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import type {
  TVendorCreateSchema,
  TVendorUpdateSchema,
  TVendor,
} from '@repo/contracts/vendor';
import { vendor } from './vendor.schema';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { TVendorQuery } from '@repo/contracts/query';
import { StockProcurementService } from 'src/stock-procurement/stock-procurement.service';
import { AuditService } from 'src/audit/audit.service';
import type { TJWTPayload } from 'src/authentication/auth.service';
import { PaginatedListResponse } from 'src/global/types/response';

@Injectable()
export class VendorService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private stockProcurementService: StockProcurementService,
    private auditService: AuditService,
  ) {}

  async createVendor(
    payload: TVendorCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const [res] = await tx
        .insert(vendor)
        .values({
          name: payload.name,
          contactPerson: payload.contactPerson,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
        })
        .returning();

      if (!res)
        throw new InternalServerErrorException('Failed to create vendor');

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: res.id,
          entityType: 'vendor',
          description: `Created vendor with id ${res.id}`,
          userId: user.id,
        },
        tx,
      );

      return res;
    });
  }

  async updateVendor(
    id: number,
    payload: TVendorUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const [res] = await tx
        .update(vendor)
        .set({
          name: payload.name,
          contactPerson: payload.contactPerson,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
        })
        .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)))
        .returning();

      if (!res)
        throw new InternalServerErrorException('Failed to update vendor');

      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'vendor',
          description: `Updated vendor with id ${id}`,
          userId: user.id,
        },
        tx,
      );

      return res;
    });
  }

  async deleteVendor(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.transaction(async (tx) => {
      await tx
        .update(vendor)
        .set({ deletedAt: new Date() })
        .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));

      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'vendor',
          description: `Deleted vendor with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async getVendor(id: number, trx?: Transaction): Promise<TVendor> {
    const db = trx ?? this.db;
    const [res] = await db
      .select({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        isActive: vendor.isActive,
      })
      .from(vendor)
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));

    if (!res) throw new NotFoundException('Vendor not found');

    const lastOrderInfo =
      await this.stockProcurementService.getLastOrderOfVendor([res.id], trx);

    return {
      ...res,
      lastOrderDate: lastOrderInfo.length
        ? lastOrderInfo[0].lastOrderDate
        : null,
    };
  }

  async getVendors(
    { query, limit = 20, page = 1, status }: TVendorQuery,
    trx?: Transaction,
  ): Promise<PaginatedListResponse<TVendor[]>> {
    const db = trx ?? this.db;
    const baseQuery = db
      .select({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        isActive: vendor.isActive,
      })
      .from(vendor)
      .where(
        and(
          isNull(vendor.deletedAt),
          ...(status
            ? [eq(vendor.isActive, status === 'active' ? true : false)]
            : []),
          ...(query
            ? [
                or(
                  gte(sql`SIMILARITY(${vendor.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${vendor.phone}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${vendor.email}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        desc(
          query
            ? sql`GREATEST(
                SIMILARITY(${vendor.name}, ${query}),
                SIMILARITY(${vendor.phone}, ${query}),
                SIMILARITY(${vendor.email}, ${query})
              )`
            : vendor.createdAt,
        ),
      )
      .as('base_query');

    const selectQuery = db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = db
      .select({ count: count().as('count') })
      .from(baseQuery);

    let [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    const lastOrderInfos =
      await this.stockProcurementService.getLastOrderOfVendor(
        list.map((i) => i.id),
        trx,
      );

    const listWithOrderDate = list.map((v) => {
      const lastOrder = lastOrderInfos.find((lo) => lo.vendorId === v.id);

      return {
        ...v,
        lastOrderDate: lastOrder ? lastOrder.lastOrderDate : null,
      };
    });

    return { list: listWithOrderDate, count: totalCount };
  }
}
