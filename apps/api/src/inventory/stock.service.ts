import { Inject, Injectable } from '@nestjs/common';
import { stock } from './inventory.schema';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class StockService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getStockDetails(productId: number) {
    const [stockDetails] = await this.db
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
  }) {
    const [entry] = await this.db
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
  ) {
    await this.db
      .update(stock)
      .set({ minStockLevel: minQuantity })
      .where(eq(stock.productId, productId));
  }

  async deleteStockEntry(productId: number) {
    await this.db.delete(stock).where(eq(stock.productId, productId));
  }
}
