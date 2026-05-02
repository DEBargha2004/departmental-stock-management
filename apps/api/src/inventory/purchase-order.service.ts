import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DATABASE_MODULE, Transaction, type TDB } from 'src/database/db.module';
import {
  TPurchaseOrderCreateSchema,
  TPurchaseOrderUpdateSchema,
} from '@repo/contracts/purchase-order';
import {
  purchaseOrder,
  purchaseOrderItems,
  stockBatch,
} from './purchase-order.schema';
import { VendorService } from 'src/vendor/vendor.service';
import { ProductService } from './product.service';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { vendor } from 'src/vendor/vendor.schema';
import { product } from './product.schema';
import { TPurchaseOrderQuery } from '@repo/contracts/query';
import { PURCHASE_ORDER_STATUS } from '@repo/contracts/status';
import { PgTransaction } from 'drizzle-orm/pg-core';

type PurchaseOrder = {
  id: number;
  invoiceId: string;
  orderDate: Date;
  status: PURCHASE_ORDER_STATUS;
  totalAmount: number;
  vendor: {
    id: number;
    name: string;
  };
  items: PurchaseOrderItem[];
};

type PurchaseOrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  product: {
    id: number;
    name: string;
  };
};

@Injectable()
export class PurchaseOrderService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private vendorService: VendorService,
    private productService: ProductService,
  ) {}

  async createPurchaseOrder(
    payload: TPurchaseOrderCreateSchema,
    trx?: Transaction
  ): Promise<PurchaseOrder> {
    const db = trx ?? this.db;
    
    const po = await db.transaction(async (tx) => {
      //check for vendor
      const vendor = await this.vendorService.getVendor(payload.vendorId);
      if (!vendor) throw new NotFoundException('Vendor not found');

      const items = await Promise.all(
        payload.items.map((item) => this.productService.getProduct(item.itemId, tx)),
      );

      //check for existence
      if (items.some((it) => !it)) {
        throw new NotFoundException('One or more items not found');
      }

      const [entry] = await tx
        .insert(purchaseOrder)
        .values({
          vendorId: payload.vendorId,
          invoiceId: payload.invoiceId,
          orderDate: payload.orderDate,
          totalAmount: payload.totalAmount,
        })
        .returning();

      const poItems = await tx
        .insert(purchaseOrderItems)
        .values(
          payload.items.map((item) => ({
            purchaseOrderId: entry.id,
            productId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        )
        .returning();

      return { entry, items: poItems, vendor, productDetails: items };
    });

    return {
      id: po.entry.id,
      invoiceId: po.entry.invoiceId,
      orderDate: po.entry.orderDate,
      status: po.entry.status,
      totalAmount: po.entry.totalAmount,
      vendor: {
        id: po.vendor.id,
        name: po.vendor.name,
      },
      items: po.items.map((poItem) => {
        const product = po.productDetails.find((p) => p!.id === poItem.productId);
        return {
          id: poItem.id,
          quantity: poItem.quantity,
          unitPrice: poItem.unitPrice,
          product: {
            id: product!.id,
            name: product!.name,
          },
        };
      }),
    };
  }



  async getPurchaseOrder(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const [po] = await db
      .select({
        id: purchaseOrder.id,
        invoiceId: purchaseOrder.invoiceId,
        orderDate: purchaseOrder.orderDate,
        status: purchaseOrder.status,
        totalAmount: purchaseOrder.totalAmount,
        vendor: sql<{
          id: number;
          name: string;
        }>`JSON_BUILD_OBJECT(
            'id', ${vendor.id}, 
            'name', ${vendor.name}
          )`.as('vendor'),
        items: sql<PurchaseOrderItem[]>`COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${purchaseOrderItems.id},
            'quantity', ${purchaseOrderItems.quantity},
            'unitPrice', ${purchaseOrderItems.unitPrice},
            'product', JSON_BUILD_OBJECT(
              'id', ${product.id},
              'name', ${product.name}
            )
          )
        ) FILTER (WHERE ${purchaseOrderItems.id} IS NOT NULL), '[]'::JSON)`.as(
          'items',
        ),
      })
      .from(purchaseOrder)
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrder.id),
      )
      .leftJoin(vendor, eq(vendor.id, purchaseOrder.vendorId))
      .leftJoin(product, eq(purchaseOrderItems.productId, product.id))
      .where(and(eq(purchaseOrder.id, id), isNull(purchaseOrder.deletedAt)))
      .groupBy(purchaseOrder.id, vendor.id, product.name);

    if (!po) {
      throw new NotFoundException(`Purchase order with id ${id} not found`);
    }

    const productList = await Promise.all(
      po.items.map((item) => this.productService.getProduct(item.product.id)),
    );

    return { order: po, list: productList };
  }

  async getPurchaseOrders({
    query = '',
    limit = 20,
    page = 1,
    status,
    vendorId,
  }: TPurchaseOrderQuery, trx?: Transaction) {
    const db = trx ?? this.db;
    const baseQuery = db
      .select({
        id: purchaseOrder.id,
        invoiceId: purchaseOrder.invoiceId,
        orderDate: purchaseOrder.orderDate,
        status: purchaseOrder.status,
        totalAmount: purchaseOrder.totalAmount,
        vendor: sql<{
          id: number;
          name: string;
        }>`JSON_BUILD_OBJECT(
          'id', ${vendor.id}, 
          'name', ${vendor.name}
        )`.as('vendor'),
        items: sql<PurchaseOrderItem[]>`COALESCE(JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ${purchaseOrderItems.id},
          'quantity', ${purchaseOrderItems.quantity},
          'unitPrice', ${purchaseOrderItems.unitPrice},
          'product', JSON_BUILD_OBJECT(
            'id', ${product.id},
            'name', ${product.name}
          )
        )
      ) FILTER (WHERE ${purchaseOrderItems.id} IS NOT NULL), '[]'::JSON)`.as(
          'items',
        ),
      })
      .from(purchaseOrder)
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrder.id),
      )
      .leftJoin(vendor, eq(vendor.id, purchaseOrder.vendorId))
      .leftJoin(product, eq(purchaseOrderItems.productId, product.id))
      .where(
        and(
          isNull(purchaseOrder.deletedAt),
          ...(query
            ? [
                or(
                  gte(
                    sql`SIMILARITY(${purchaseOrder.invoiceId}, ${query})`,
                    0.3,
                  ),
                  gte(sql`SIMILARITY(${vendor.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${product.name}, ${query})`, 0.3),
                ),
              ]
            : []),
          ...(vendorId ? [eq(purchaseOrder.vendorId, vendorId)] : []),
          ...(status ? [eq(purchaseOrder.status, status)] : []),
        ),
      )
      .groupBy(purchaseOrder.id, vendor.id, product.name)
      .orderBy(
        query
          ? desc(
              sql`
            GREATEST(
              SIMILARITY(${purchaseOrder.invoiceId}, ${query}),
              SIMILARITY(${vendor.name}, ${query}),
              SIMILARITY(${product.name}, ${query})
            )
          `,
            )
          : desc(purchaseOrder.createdAt),
      )
      .as('base_query');

    const selectQuery = db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = db
      .select({
        count: count(),
      })
      .from(baseQuery);

    const [result, [{ count: totalCount }]] = await Promise.all([
      selectQuery,
      countQuery,
    ]);

    return {
      list: result as PurchaseOrder[],
      count: totalCount,
    };
  }

  async updatePurchaseOrder(id: number, payload: TPurchaseOrderUpdateSchema, trx?: Transaction) {
    const db = trx ?? this.db;

    const newPo = await db.transaction(async (tx) => {
      //check for existence
      const po = await this.getPurchaseOrder(id, tx);
      if (!po) throw new NotFoundException('Purchase order not found');

      //check for vendor
      const vendor = await this.vendorService.getVendor(payload.vendorId);
      if (!vendor) throw new NotFoundException('Vendor not found');

      const items = await Promise.all(
        payload.items.map((item) => this.productService.getProduct(item.itemId, tx)),
      );

      //check for existence
      if (items.some((it) => !it)) {
        throw new NotFoundException('One or more items not found');
      }

      //check for if stock entry exists for the items, if yes then block update
      //as it can lead to data inconsistency. User has to manually delete and create new PO in that case
      const existingStockBatch = await this.getStockBatch(id, tx);
      if (existingStockBatch) {
        throw new ConflictException(
          `Cannot update purchase order as stock entry exists for this order. 
           Please delete the existing stock entry and try again.`,
        );
      }

      //delete existing items
      await tx
        .delete(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchaseOrderId, id));

      //add new items
      await tx.insert(purchaseOrderItems).values(
        payload.items.map((item) => ({
          purchaseOrderId: id,
          productId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );

      //update po metadata
      const [updatedPo] = await tx
        .update(purchaseOrder)
        .set({
          vendorId: payload.vendorId,
          invoiceId: payload.invoiceId,
          orderDate: payload.orderDate,
          totalAmount: payload.totalAmount,
        })
        .where(eq(purchaseOrder.id, id))
        .returning();

      return { po: updatedPo, vendor, items };
    });

    return {
      id: newPo.po.id,
      invoiceId: newPo.po.invoiceId,
      orderDate: newPo.po.orderDate,
      status: newPo.po.status,
      totalAmount: newPo.po.totalAmount,
      vendor: {
        id: newPo.vendor.id,
        name: newPo.vendor.name,
      },
      items: payload.items.map((item) => {
        const product = newPo.items.find((p) => p!.id === item.itemId);
        return {
          id: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: {
            id: product!.id,
            name: product!.name,
          },
        };
      }),
    };
  }



  async updatePurchaseOrderStatus(
    id: number,
    status: PURCHASE_ORDER_STATUS,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    await db.transaction(async (tx) => {
      const res = await tx
        .update(purchaseOrder)
        .set({
          status,
        })
        .where(and(eq(purchaseOrder.id, id), isNull(purchaseOrder.deletedAt)));

      if (!res.rowCount) {
        throw new NotFoundException(`Purchase order with id ${id} not found`);
      }
    });
  }

  async deletePurchaseOrder(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    
    await db.transaction(async (tx) => {
      //check for stock entry existence
      const existingStockBatch = await this.getStockBatch(id, tx);
      if (existingStockBatch) {
        throw new ConflictException(
          `Cannot delete purchase order as stock entry exists for this order. 
           Please delete the existing stock entry and try again.`,
        );
      }

      const res = await tx
        .update(purchaseOrder)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(purchaseOrder.id, id));

      if (!res.rowCount) {
        throw new NotFoundException(`Purchase order with id ${id} not found`);
      }
    });
  }

  async getStockBatch(poId: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const [sb] = await db
      .select()
      .from(stockBatch)
      .where(
        and(isNull(stockBatch.deletedAt), eq(stockBatch.purchaseOrderId, poId)),
      );

    return sb;
  }
}
