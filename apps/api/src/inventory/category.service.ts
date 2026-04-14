import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TCategoryCreateSchema } from '@repo/contracts/category';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { category } from './category.schema';
import { TQuery } from 'src/global/types/query';
import { STATUS } from '@repo/contracts/status';
import { TCategoryQuery } from '@repo/contracts/query';
import { product } from './product.schema';

@Injectable()
export class CategoryService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createCategory(categoryDto: TCategoryCreateSchema) {
    const [cat] = await this.db
      .insert(category)
      .values({
        name: categoryDto.name,
        description: categoryDto.description,
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

  async getCategories({ query, limit = 20, page = 1, status }: TCategoryQuery) {
    const baseQuery = this.db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
        itemsCount: count(product.id).as('productsCount'),
      })
      .from(category)
      .leftJoin(product, eq(category.id, product.categoryId))
      .where(
        and(
          isNull(category.deletedAt),
          ...(status
            ? [eq(category.isActive, status === 'active' ? true : false)]
            : []),
          ...(query && [
            or(
              gte(sql`SIMILARITY(${category.name}, ${query})`, 0.3),
              gte(sql`SIMILARITY(${category.description}, ${query})`, 0.3),
            ),
          ]),
        ),
      )
      .orderBy(
        query
          ? desc(sql`GREATEST(
          SIMILARITY(${category.name}, ${query}),
          SIMILARITY(${category.description}, ${query})
          )`)
          : desc(category.createdAt),
      )
      .groupBy(category.id)
      .as('base_query');

    const selectQuery = this.db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = this.db.select({ count: count() }).from(baseQuery);

    const [categories, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return { list: categories, count: totalCount };
  }

  async updateCategory(id: number, categoryDto: TCategoryCreateSchema) {
    const existing = await this.getCategory(id);
    if (!existing) throw new NotFoundException('Category not available');

    const [cat] = await this.db
      .update(category)
      .set({ name: categoryDto.name, description: categoryDto.description })
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
}
