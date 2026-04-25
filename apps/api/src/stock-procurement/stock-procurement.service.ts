import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { max, inArray } from 'drizzle-orm';
import { purchaseOrder } from 'src/inventory/purchase-order.schema';

@Injectable()
export class StockProcurementService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

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
