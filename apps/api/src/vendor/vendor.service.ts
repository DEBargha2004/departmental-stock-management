import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import {
  type TVendorCreateSchema,
  type TVendorUpdateSchema,
} from '@repo/contracts/vendor';
import { vendor } from './vendor.schema';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import type { TFilter } from '@repo/contracts/filter';
import { TQuery, TVendorQuery } from '@repo/contracts/query';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class VendorService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private inventoryService: InventoryService,
  ) {}

  async createVendor(payload: TVendorCreateSchema) {
    const [res] = await this.db
      .insert(vendor)
      .values({
        name: payload.name,
        contactPerson: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
      })
      .returning();

    if (!res) throw new InternalServerErrorException('Failed to create vendor');

    return res;
  }

  async updateVendor(id: number, payload: TVendorUpdateSchema) {
    const [res] = await this.db
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

    if (!res) throw new InternalServerErrorException('Failed to update vendor');

    return res;
  }

  async deleteVendor(id: number) {
    await this.db
      .update(vendor)
      .set({ deletedAt: new Date() })
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));
  }

  async getVendor(id: number) {
    const [res] = await this.db
      .select({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
      })
      .from(vendor)
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));

    if (!res) throw new NotFoundException('Vendor not found');

    const lastOrderInfo = await this.inventoryService.getLastOrderOfVendor([
      res.id,
    ]);

    return {
      ...res,
      lastOrderDate: lastOrderInfo.length
        ? lastOrderInfo[0].lastOrderDate
        : null,
    };
  }

  async getVendors({ query, limit = 20, page = 1, status }: TVendorQuery) {
    const baseQuery = this.db
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

    const selectQuery = this.db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = this.db
      .select({ count: count().as('count') })
      .from(baseQuery);

    let [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    const lastOrderInfos = await this.inventoryService.getLastOrderOfVendor(
      list.map((i) => i.id),
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
