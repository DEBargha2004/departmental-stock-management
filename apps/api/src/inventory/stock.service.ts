import { Inject, Injectable } from '@nestjs/common';
import { stock } from './inventory.schema';
import { DATABASE_MODULE, type TDB, type Transaction } from 'src/database/db.module';
import { eq, inArray, max } from 'drizzle-orm';
import { TPurchaseOrderCreateSchema } from '@repo/contracts/purchase-order';

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

  async createNewStockEntry({
    productId,
    minQuantity,
    quantity,
  }: {
    productId: number;
    quantity: number;
    minQuantity: number;
  }, trx?: Transaction) {
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

  async updateStockMetadata(
    productId: number,
    { minQuantity }: { minQuantity: number },
    trx?: Transaction
  ) {
    const db = trx ?? this.db;
    await db
      .update(stock)
      .set({ minStockLevel: minQuantity })
      .where(eq(stock.productId, productId));
  }

  async deleteStockEntry(productId: number, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.delete(stock).where(eq(stock.productId, productId));
  }
}
