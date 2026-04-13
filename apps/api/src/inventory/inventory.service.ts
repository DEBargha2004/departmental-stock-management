import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import type { TCategoryCreateSchema } from '@repo/contracts/category';
import type { TItemCreateSchema } from '@repo/contracts/item';
import { and, desc, eq, gte, inArray, isNull, max, or, sql } from 'drizzle-orm';
import { item } from './item.schema';
import { stock } from './stock.schema';
import { category } from './category.schema';
import { TQuery } from 'src/global/types/query';
import { Status } from '@repo/contracts/status';
import { purchaseOrder } from './inventory.schema';

@Injectable()
export class InventoryService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createItem(itemDto: TItemCreateSchema) {
    return await this.db.transaction(async (trx) => {
      const [res] = await this.db
        .insert(item)
        .values({
          name: itemDto.name,
          categoryId: itemDto.categoryId,
          minStockLevel: itemDto.minStockLevel,
          imageUrl: itemDto.imageUrl,
        })
        .returning();

      await this.db.insert(stock).values({
        itemId: res.id,
      });

      return res;
    });
  }
  async getItem(id: number) {
    const [it] = await this.db
      .select()
      .from(item)
      .where(and(isNull(item.deletedAt), eq(item.id, id)));

    return it;
  }

  async getItems({
    query,
    limit,
    page,
    status,
  }: TQuery & {
    status: Status;
  }) {
    const items = await this.db
      .select()
      .from(item)
      .leftJoin(category, eq(item.categoryId, category.id))
      .where(
        and(
          isNull(item.deletedAt),
          eq(item.isActive, status === 'active' ? true : false),
          ...(query && [
            or(
              gte(sql`SIMILARITY(${item.name}, ${query})`, 0.3),
              gte(sql`SIMILARITY(${category.name}, ${query})`, 0.3),
            ),
          ]),
        ),
      )
      .orderBy(
        query
          ? desc(sql`GREATEST(
                SIMILARITY(${item.name}, ${query}),
                SIMILARITY(${category.name}, ${query})
             
            )`)
          : desc(item.createdAt),
      )
      .limit(30);

    return items;
  }

  async updateItem(id: number, itemDto: TItemCreateSchema) {
    const existing = await this.getItem(id);
    if (!existing) throw new NotFoundException('Item Not found');

    const [it] = await this.db
      .update(item)
      .set(itemDto)
      .where(eq(item.id, id))
      .returning();

    return it;
  }

  async deleteItem(id: number) {
    await this.db
      .update(item)
      .set({ deletedAt: new Date() })
      .where(eq(item.id, id));
  }

  async getLastOrderOfVendor(vendorIds: number[]) {
    const res = await this.db
      .select({
        vendorId: purchaseOrder.vendorId,
        lastOrderDate: max(purchaseOrder.orderDate),
      })
      .from(purchaseOrder)
      .where(inArray(purchaseOrder.vendorId, vendorIds))
      .groupBy(purchaseOrder.vendorId);

    return res;
  }
}
