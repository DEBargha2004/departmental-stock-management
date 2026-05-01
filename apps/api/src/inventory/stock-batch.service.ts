import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TStockBatchQuery } from '@repo/contracts/query';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import {
  purchaseOrder,
  purchaseOrderItems,
  stockBatch,
  stockBatchItems,
} from './purchase-order.schema';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { vendor } from 'src/vendor/vendor.schema';
import { product } from './product.schema';

type TStockBatch = {
  id: number;
  batchNumber: string;
  purchaseOrder: {
    id: number;
    invoiceId: string;
    totalAmount: number;
    status: string;
    orderDate: Date;
  };
  vendor: {
    id: number;
    name: string;
  };
  arrivalDate: string;
  items: {
    id: number;
    product: {
      id: number;
      name: string;
    };
    quantity: number;
    unitPrice: number;
  }[];
};

@Injectable()
export class StockBatchService {
  constructor(@Inject(DATABASE_MODULE) private readonly db: TDB) {}

  async getStockBatch(id: number) {
    const [res] = await this.db
      .select({
        id: stockBatch.id,
        batchNumber: stockBatch.batchNumber,
        purchaseOrder: sql<TStockBatch['purchaseOrder']>`JSON_BUILD_OBJECT(
          'id', ${purchaseOrder.id},
          'invoiceId', ${purchaseOrder.invoiceId},
          'totalAmount', ${purchaseOrder.totalAmount},
          'status', ${purchaseOrder.status},
          'orderDate', ${purchaseOrder.orderDate}
        )`.as('purchaseOrder'),
        vendor: sql<TStockBatch['vendor']>`JSON_BUILD_OBJECT(
          'id', ${vendor.id},
          'name', ${vendor.name}
        )`.as('vendor'),
        arrivalDate: stockBatch.arrivalDate,
        items: sql<TStockBatch['items']>`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${stockBatchItems.id},
              'product', JSON_BUILD_OBJECT(
                  'id', ${product.id},
                  'name', ${product.name}
              ),
              'quantity', ${stockBatchItems.quantityReceived},
              'unitPrice', ${purchaseOrderItems.unitPrice}
            )
          ),
          '[]'::JSON
        ) FILTER (WHERE ${stockBatchItems.id} IS NOT NULL)`.as('items'),
      })
      .from(stockBatch)
      .leftJoin(stockBatchItems, eq(stockBatch.id, stockBatchItems.batchId))
      .leftJoin(purchaseOrder, eq(purchaseOrder.id, stockBatch.purchaseOrderId))
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrder.id),
      )
      .leftJoin(vendor, eq(purchaseOrder.vendorId, vendor.id))
      .leftJoin(product, eq(product.id, purchaseOrderItems.productId))
      .where(eq(stockBatch.id, id));

    if (!res) {
      throw new NotFoundException(`Stock batch with id ${id} not found`);
    }

    return res;
  }

  async getStockBatches({
    query = '',
    limit = 20,
    page = 1,
    vendorId,
  }: TStockBatchQuery): Promise<{ list: TStockBatch[]; count: number }> {
    const searchQuery = this.db
      .select({
        id: stockBatch.id,
        batchNumber: stockBatch.batchNumber,
        purchaseOrder: sql<TStockBatch['purchaseOrder']>`JSON_BUILD_OBJECT(
          'id', ${purchaseOrder.id},
          'invoiceId', ${purchaseOrder.invoiceId},
          'totalAmount', ${purchaseOrder.totalAmount},
          'status', ${purchaseOrder.status},
          'orderDate', ${purchaseOrder.orderDate}
        )`.as('purchaseOrder'),
        vendor: sql<TStockBatch['vendor']>`JSON_BUILD_OBJECT(
          'id', ${vendor.id},
          'name', ${vendor.name}
        )`.as('vendor'),
        arrivalDate: stockBatch.arrivalDate,
        items: sql<TStockBatch['items']>`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${stockBatchItems.id},
              'product', JSON_BUILD_OBJECT(
                  'id', ${product.id},
                  'name', ${product.name}
              ),
              'quantity', ${stockBatchItems.quantityReceived},
              'unitPrice', ${purchaseOrderItems.unitPrice}
            )
          ) FILTER (WHERE ${stockBatchItems.id} IS NOT NULL),
          '[]'::JSON
        )`.as('items'),
      })
      .from(stockBatch)
      .leftJoin(stockBatchItems, eq(stockBatch.id, stockBatchItems.batchId))
      .leftJoin(purchaseOrder, eq(purchaseOrder.id, stockBatch.purchaseOrderId))
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrder.id),
      )
      .leftJoin(vendor, eq(purchaseOrder.vendorId, vendor.id))
      .leftJoin(product, eq(product.id, purchaseOrderItems.productId))
      .where(
        and(
          isNull(stockBatch.deletedAt),
          ...(vendorId ? [eq(vendor.id, vendorId)] : []),
          ...(query
            ? [
                or(
                  gte(
                    sql`SIMILARITY(${stockBatch.purchaseOrderId}, ${query})`,
                    0.3,
                  ),
                  gte(
                    sql`SIMILARITY(${purchaseOrder.invoiceId}, ${query})`,
                    0.3,
                  ),
                ),
              ]
            : []),
        ),
      )
      .groupBy(stockBatch.id, purchaseOrder.id, vendor.id)
      .orderBy(
        query
          ? desc(
              sql`
          GREATEST(
            SIMILARITY(${stockBatch.purchaseOrderId}, ${query}),
            SIMILARITY(${purchaseOrder.invoiceId}, ${query})
          )
        `,
            )
          : desc(stockBatch.createdAt),
      )
      .as('base_query');

    const selectQuery = this.db
      .select()
      .from(searchQuery)
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = this.db
      .select({ count: count(stockBatch.id) })
      .from(searchQuery);

    const [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return { list, count: totalCount };
  }

  async createStockBatch() {}

  async updateStockBatch() {}

  async deleteStockBatch() {}
}
