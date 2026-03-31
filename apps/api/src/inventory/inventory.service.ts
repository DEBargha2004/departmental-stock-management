import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import type { TCategoryCreateSchema } from '@repo/contracts/category';
import type { TItemCreateSchema } from '@repo/contracts/item';
import { category, item, stock } from './inventory.schema';
import { and, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';

@Injectable()
export class InventoryService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createCategory(categoryDto: TCategoryCreateSchema) {
    const [cat] = await this.db
      .insert(category)
      .values({
        name: categoryDto.name,
      })
      .returning();

    return cat;
  }

  async getCategory(id: number) {
    const [cat] = await this.db
      .select()
      .from(category)
      .where(and(isNull(category.deletedAt), eq(category.id, id)));

    return cat;
  }

  async getCategories(q?: string) {
    const cats = await this.db
      .select()
      .from(category)
      .where(
        and(
          isNull(category.deletedAt),
          ...(q && [or(gte(sql`SIMILARITY(${category.name}), ${q}`, 0.3))]),
        ),
      )
      .orderBy(
        q
          ? desc(sql`GREATEST(
        SIMILARITY(${category.name}, ${q})
        )`)
          : desc(category.createdAt),
      )
      .limit(30);

    return cats;
  }

  async updateCategory(id: number, categoryDto: TCategoryCreateSchema) {
    const existing = await this.getCategory(id);
    if (!existing) throw new NotFoundException('Category not available');

    const [cat] = await this.db
      .update(category)
      .set({ name: categoryDto.name })
      .where(eq(category.id, id))
      .returning();

    return cat;
  }

  async deleteCategory(id: number) {
    await this.db
      .update(category)
      .set({ deletedAt: new Date() })
      .where(eq(category.id, id));
  }

  async createItem(itemDto: TItemCreateSchema) {
    return await this.db.transaction(async (trx) => {
      const [res] = await this.db
        .insert(item)
        .values({
          name: itemDto.name,
          categoryId: itemDto.categoryId,
          minStockLevel: itemDto.minStockLevel,
          status: itemDto.status,
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

  async getItems(q?: string) {
    const [its] = await this.db
      .select()
      .from(item)
      .leftJoin(category, eq(item.categoryId, category.id))
      .where(
        and(
          isNull(item.deletedAt),
          ...(q && [
            or(
              gte(sql`SIMILARITY(${item.name}, ${q})`, 0.3),
              gte(sql`SIMILARITY(${category.name}, ${q})`, 0.3),
              gte(sql`SIMILARITY(${item.status}, ${q})`, 0.3),
            ),
          ]),
        ),
      )
      .orderBy(
        q
          ? desc(sql`GREATEST(
                SIMILARITY(${item.name}, ${q}),
                SIMILARITY(${category.name}, ${q}),
                SIMILARITY(${item.status}, ${q})
            )`)
          : desc(item.createdAt),
      )
      .limit(30);

    return its;
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
}
