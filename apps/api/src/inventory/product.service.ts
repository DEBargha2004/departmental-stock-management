import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import {
  TProductUpdateSchema,
  type TProductCreateSchema,
  type TProduct,
} from '@repo/contracts/item';
import { TProductQuery } from '@repo/contracts/query';
import { product } from './product.schema';
import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { category } from './category.schema';
import { stock } from './inventory.schema';

type TCategoryForProduct = {
  id: number;
  name: string;
  description: string;
};

type TStockForProduct = {
  quantity: number;
  minStockLevel: number;
};

@Injectable()
export class ProductService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createProduct(payload: TProductCreateSchema, trx?: Transaction) {
    const db = trx ?? this.db;
    const [pr] = await db
      .insert(product)
      .values({
        name: payload.name,
        categoryId: payload.categoryId,
        imageUrl: payload.imageUrl,
        price: payload.price,
        description: payload.description,
        isConsumable: payload.isConsumable,
      })
      .returning();

    return pr;
  }

  async updateProduct(
    id: number,
    payload: TProductUpdateSchema,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    const [pr] = await db
      .update(product)
      .set({
        name: payload.name,
        categoryId: payload.categoryId,
        imageUrl: payload.imageUrl,
        price: payload.price,
        description: payload.description,
        isConsumable: payload.isConsumable,
      })
      .where(eq(product.id, id))
      .returning();

    return pr;
  }

  async getProduct(id: number, trx?: Transaction): Promise<TProduct> {
    const db = trx ?? this.db;
    const [pr] = await db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        isConsumable: product.isConsumable,
        imageUrl: product.imageUrl,
        price: product.price,
        category: sql<TCategoryForProduct>`JSON_BUILD_OBJECT(
          'id', ${category.id},
          'name', ${category.name},
          'description', ${category.description}
        )`.as('category'),
        stock: sql<TStockForProduct>`JSON_BUILD_OBJECT(
          'quantity', ${stock.quantityAvailable},
          'minStockLevel', ${stock.minStockLevel}
        )`.as('stock'),
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(stock, eq(stock.productId, product.id))
      .where(
        and(
          isNull(product.deletedAt),
          isNull(category.deletedAt),
          eq(product.id, id),
        ),
      );

    return pr;
  }

  async getProductList(ids: number[], trx?: Transaction): Promise<TProduct[]> {
    const db = trx ?? this.db;
    const list = await db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        isConsumable: product.isConsumable,
        category: sql<TCategoryForProduct>`JSON_BUILD_OBJECT(
          'id', ${category.id},
          'name', ${category.name},
          'description', ${category.description}
        )`.as('category'),
        stock: sql<TStockForProduct>`JSON_BUILD_OBJECT(
          'quantity', ${stock.quantityAvailable},
          'minStockLevel', ${stock.minStockLevel}
        )`.as('stock'),
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(stock, eq(stock.productId, product.id))
      .where(
        and(
          isNull(product.deletedAt),
          isNull(category.deletedAt),
          inArray(product.id, ids),
        ),
      );

    return list;
  }

  async getProducts(
    { query = '', limit = 20, page = 1, category: cat, status }: TProductQuery,
    trx?: Transaction,
  ): Promise<{ list: TProduct[]; count: number }> {
    const db = trx ?? this.db;
    const baseQuery = db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        isConsumable: product.isConsumable,
        category: sql<TCategoryForProduct>`JSON_BUILD_OBJECT(
          'id', ${category.id},
          'name', ${category.name},
          'description', ${category.description}
        )`.as('category'),
        stock: sql<TStockForProduct>`JSON_BUILD_OBJECT(
          'quantity', ${stock.quantityAvailable},
          'minStockLevel', ${stock.minStockLevel}
        )`.as('stock'),
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(stock, eq(stock.productId, product.id))
      .where(
        and(
          isNull(product.deletedAt),
          isNull(category.deletedAt),
          ...(cat != null ? [eq(category.id, cat)] : []),
          ...(status === 'in_stock'
            ? [gt(stock.quantityAvailable, stock.minStockLevel)]
            : []),
          ...(status === 'low_stock'
            ? [
                and(
                  gt(stock.quantityAvailable, 0),
                  lte(stock.quantityAvailable, stock.minStockLevel),
                ),
              ]
            : []),
          ...(status === 'out_of_stock'
            ? [eq(stock.quantityAvailable, 0)]
            : []),
          ...(query
            ? [
                or(
                  gte(sql`SIMILARITY(${product.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${category.name}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        query
          ? desc(
              sql`GREATEST(
                SIMILARITY(${product.name}, ${query}),
                SIMILARITY(${category.name}, ${query})
                )`,
            )
          : desc(product.createdAt),
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

    const [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return { list, count: totalCount };
  }

  async deleteProduct(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.transaction(async (tx) => {
      const existingProduct = await this.getProduct(id, tx);
      if (!existingProduct) throw new NotFoundException('Item Not found');

      await tx
        .update(product)
        .set({ deletedAt: new Date() })
        .where(eq(product.id, id));
    });
  }
}
