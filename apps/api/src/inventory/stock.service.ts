import { Inject, Injectable } from '@nestjs/common';
import {
  product,
  stock,
  stockMovement,
  TDBStock,
  TDBStockMovement,
} from './inventory.schema';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import { eq, inArray, max, sql } from 'drizzle-orm';

type TStockUpdate = {
  productId: number;
  payload: Partial<Omit<TDBStock, 'productId'>>;
};

export type TProductForStockDetails = {
  id: number;
  name: string;
  isConsumable: boolean;
};

type TFullStockDetails = {
  id: number;
  minStockLevel: number;
  quantityAvailable: number;
  quantityDamaged: number;
  quantityIssued: number;
  product: TProductForStockDetails;
};

@Injectable()
export class StockService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getStockDetails(
    productId: number,
    trx?: Transaction,
  ): Promise<TFullStockDetails | null> {
    const db = trx ?? this.db;
    const [stockDetails] = await db
      .select({
        id: stock.id,
        minStockLevel: stock.minStockLevel,
        quantityAvailable: stock.quantityAvailable,
        quantityDamaged: stock.quantityDamaged,
        quantityIssued: stock.quantityIssued,
        product: sql<TProductForStockDetails>`JSON_BUILD_OBJECT(
          'name',${product.name},
          'id',${product.id},
          'isConsumable',${product.isConsumable}
        )`,
      })
      .from(stock)
      .leftJoin(product, eq(stock.productId, product.id))
      .where(eq(stock.productId, productId));

    return stockDetails;
  }

  async getStockDetailsList(
    productIds: number[],
    trx?: Transaction,
  ): Promise<TFullStockDetails[]> {
    const db = trx ?? this.db;

    const list = await db
      .select({
        id: stock.id,
        minStockLevel: stock.minStockLevel,
        quantityAvailable: stock.quantityAvailable,
        quantityDamaged: stock.quantityDamaged,
        quantityIssued: stock.quantityIssued,
        product: sql<TProductForStockDetails>`JSON_BUILD_OBJECT(
          'name',${product.name},
          'id',${product.id},
          'isConsumable',${product.isConsumable}
        )`,
      })
      .from(stock)
      .leftJoin(product, eq(stock.productId, product.id))
      .where(inArray(stock.productId, productIds));

    return list;
  }

  async createNewStockEntry(
    {
      productId,
      minQuantity,
      quantity,
    }: {
      productId: number;
      quantity: number;
      minQuantity: number;
    },
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    const [entry] = await db
      .insert(stock)
      .values({
        productId: productId,
        minStockLevel: minQuantity,
        quantityAvailable: quantity,
      })
      .returning();

    return entry;
  }

  async updateStockMetadata(props: TStockUpdate[], trx?: Transaction) {
    const db = trx ?? this.db;
    if (!props.length) return;

    const values = props.map(
      (i) => sql`(
      ${i.productId}::integer,
      ${i.payload.minStockLevel ?? null}::integer,
      ${i.payload.quantityAvailable ?? null}::integer,
      ${i.payload.quantityDamaged ?? null}::integer,
      ${i.payload.quantityIssued ?? null}::integer
    )`,
    );

    await db.execute(sql`
    UPDATE ${stock}
    SET
      ${sql.raw(stock.minStockLevel.name)}     = COALESCE(v.min_stock_level,      ${stock.minStockLevel}),
      ${sql.raw(stock.quantityAvailable.name)} = COALESCE(v.quantity_available,   ${stock.quantityAvailable}),
      ${sql.raw(stock.quantityDamaged.name)}   = COALESCE(v.quantity_damaged,     ${stock.quantityDamaged}),
      ${sql.raw(stock.quantityIssued.name)}    = COALESCE(v.quantity_issued,      ${stock.quantityIssued})
    FROM (
      VALUES ${sql.join(values, sql`, `)}
    ) AS v(product_id, min_stock_level, quantity_available, quantity_damaged, quantity_issued)
    WHERE ${stock.productId} = v.product_id
  `);
  }

  async deleteStockEntry(productId: number, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.delete(stock).where(eq(stock.productId, productId));
  }

  async createStockMovement(payload: TDBStockMovement[], trx?: Transaction) {
    const db = trx ?? this.db;
    if (!payload.length) return;

    await db.insert(stockMovement).values(payload);
  }
}
