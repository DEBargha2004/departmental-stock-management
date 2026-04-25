import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import {
  TPurchaseOrderCreateSchema,
  TPurchaseOrderUpdateSchema,
} from '@repo/contracts/purchase-order';
import { purchaseOrder, purchaseOrderItems } from './purchase-order.schema';
import { VendorService } from 'src/vendor/vendor.service';
import { ProductService } from './product.service';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { vendor } from 'src/vendor/vendor.schema';
import { product } from './product.schema';
import { TPurchaseOrderQuery } from '@repo/contracts/query';
import { PURCHASE_ORDER_STATUS } from '@repo/contracts/status';

type PurchaseOrder = {
  id: number;
  invoiceId: string;
  orderDate: string;
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
  ): Promise<PurchaseOrder> {
    //check for vendor
    const vendor = await this.vendorService.getVendor(payload.vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const items = await Promise.all(
      payload.items.map((item) => this.productService.getProduct(item.itemId)),
    );

    //check for existence
    if (items.some((it) => !it)) {
      throw new NotFoundException('One or more items not found');
    }

    const po = await this.db.transaction(async (trx) => {
      const [entry] = await trx
        .insert(purchaseOrder)
        .values({
          vendorId: payload.vendorId,
          invoiceId: payload.invoiceId,
          orderDate: payload.orderDate,
          totalAmount: payload.totalAmount,
        })
        .returning();

      const items = await trx
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

      return { entry, items };
    });

    return {
      id: po.entry.id,
      invoiceId: po.entry.invoiceId,
      orderDate: po.entry.orderDate,
      status: po.entry.status,
      totalAmount: po.entry.totalAmount,
      vendor: {
        id: vendor.id,
        name: vendor.name,
      },
      items: po.items.map((poItem) => {
        const product = items.find((p) => p.id === poItem.productId);
        return {
          id: poItem.id,
          quantity: poItem.quantity,
          unitPrice: poItem.unitPrice,
          product: {
            id: product.id,
            name: product.name,
          },
        };
      }),
    };
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    const [po] = await this.db
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
        ), '[]')`.as('items'),
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
          eq(purchaseOrder.id, id),
          isNull(purchaseOrder.deletedAt),
          isNull(purchaseOrderItems.deletedAt),
        ),
      )
      .groupBy(purchaseOrder.id, vendor.id, product.name);

    return po;
  }

  async getPurchaseOrders({
    query = '',
    limit = 20,
    page = 1,
    status,
    vendorId,
  }: TPurchaseOrderQuery) {
    const baseQuery = this.db
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
      ), '[]')`.as('items'),
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
          isNull(purchaseOrderItems.deletedAt),
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

    const selectQuery = this.db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = this.db
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

  async updatePurchaseOrder(id: number, payload: TPurchaseOrderUpdateSchema) {}

  async deletePurchaseOrder(id: number) {
    await this.db
      .update(purchaseOrder)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(purchaseOrder.id, id));
  }
}
