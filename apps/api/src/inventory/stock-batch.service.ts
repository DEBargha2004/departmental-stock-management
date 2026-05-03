import { Inject, Injectable } from '@nestjs/common';
import { TStockBatchQuery } from '@repo/contracts/query';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import {
  purchaseOrder,
  purchaseOrderItems,
  stockBatch,
  stockBatchItems,
} from './purchase-order.schema';
import { and, count, desc, eq, gte, or, sql } from 'drizzle-orm';
import { vendor } from 'src/vendor/vendor.schema';
import { product } from './product.schema';
import {
  TStockBatchCreateSchema,
  TStockBatchUpdateSchema,
} from '@repo/contracts/stock-batch';

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
  arrivalDate: Date;
  items: {
    id: number;
    purchaseOrderItemId: number;
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

  async getStockBatch(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const [res] = await db
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
              'purchaseOrderItemId', ${stockBatchItems.purchaseOrderItemId},
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
      .groupBy(stockBatch.id, purchaseOrder.id, vendor.id)
      .where(eq(stockBatch.id, id));

    return res;
  }
  async getStockBatchByPurchaseOrder(poId: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const [res] = await db
      .select()
      .from(stockBatch)
      .where(and(eq(stockBatch.purchaseOrderId, poId)));

    return res;
  }

  async getStockBatches(
    { query = '', limit = 20, page = 1, vendorId }: TStockBatchQuery,
    trx?: Transaction,
  ): Promise<{ list: TStockBatch[]; count: number }> {
    const db = trx ?? this.db;
    const searchQuery = db
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
              'purchaseOrderItemId', ${stockBatchItems.purchaseOrderItemId},
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

    const selectQuery = db
      .select()
      .from(searchQuery)
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = db
      .select({ count: count(stockBatch.id) })
      .from(searchQuery);

    const [list, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return { list, count: totalCount };
  }

  async createStockBatch(payload: TStockBatchCreateSchema, trx?: Transaction) {
    const db = trx ?? this.db;

    return await db.transaction(async (tx) => {
      const [batch] = await tx
        .insert(stockBatch)
        .values({
          batchNumber: payload.batchNumber,
          purchaseOrderId: payload.purchaseOrderId,
          arrivalDate: payload.arrivalDate,
        })
        .returning();

      await tx.insert(stockBatchItems).values(
        payload.purchaseItems.map((item) => ({
          batchId: batch.id,
          purchaseOrderItemId: item.purchaseItemId,
          quantityReceived: item.quantityReceived,
        })),
      );

      return batch;
    });
  }

  async updateStockBatch(
    id: number,
    payload: TStockBatchUpdateSchema,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      await tx
        .update(stockBatch)
        .set({
          batchNumber: payload.batchNumber,
          purchaseOrderId: payload.purchaseOrderId,
          arrivalDate: payload.arrivalDate,
        })
        .where(eq(stockBatch.id, id));

      await tx.delete(stockBatchItems).where(eq(stockBatchItems.batchId, id));

      await tx.insert(stockBatchItems).values(
        payload.purchaseItems.map((item) => ({
          batchId: id,
          purchaseOrderItemId: item.purchaseItemId,
          quantityReceived: item.quantityReceived,
        })),
      );
    });
  }

  async deleteStockBatch(id: number, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      await tx.delete(stockBatchItems).where(eq(stockBatchItems.batchId, id));

      await tx.delete(stockBatch).where(eq(stockBatch.id, id));
    });
  }
}
