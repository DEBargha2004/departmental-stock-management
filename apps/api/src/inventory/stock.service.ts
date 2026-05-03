import { Inject, Injectable } from '@nestjs/common';
import {
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
import { TPurchaseOrderCreateSchema } from '@repo/contracts/purchase-order';

type TStockUpdate = {
  productId: number;
  payload: Partial<Omit<TDBStock, 'productId'>>;
};

@Injectable()
export class StockService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getStockDetails(productId: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const [stockDetails] = await db
      .select()
      .from(stock)
      .where(eq(stock.productId, productId));

    return stockDetails;
  }

  async getStockDetailsList(productIds: number[], trx?: Transaction) {
    const db = trx ?? this.db;

    const list = await db
      .select()
      .from(stock)
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

    const values = props.map(
      (i) => sql`
      (
        ${i.productId},
        ${i.payload.minStockLevel ?? null},
        ${i.payload.quantityAvailable ?? null},
        ${i.payload.quantityDamaged ?? null},
        ${i.payload.quantityIssued ?? null}
      )`,
    );

    if (!values.length) return;

    await db.execute(sql`
      UPDATE ${stock}
      SET
        ${stock.minStockLevel} = COALESCE(v.min_stock_level, ${stock.minStockLevel}),
        ${stock.quantityAvailable} = COALESCE(v.quantity_available, ${stock.quantityAvailable}),
        ${stock.quantityDamaged} = COALESCE(v.quantity_damaged, ${stock.quantityDamaged}),
        ${stock.quantityIssued} = COALESCE(v.quantity_issued, ${stock.quantityIssued})
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

    await db.insert(stockMovement).values(payload);
  }
}
