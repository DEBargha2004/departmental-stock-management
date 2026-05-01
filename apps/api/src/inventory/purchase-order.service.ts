import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
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

  async getPurchaseOrder(id: number) {
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

  async updatePurchaseOrder(id: number, payload: TPurchaseOrderUpdateSchema) {
    //check for existence
    const po = await this.getPurchaseOrder(id);
    if (!po) throw new NotFoundException('Purchase order not found');

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

    //check for if stock entry exists for the items, if yes then block update
    //as it can lead to data inconsistency. User has to manually delete and create new PO in that case
    const existingStockBatch = await this.getStockBatch(id);
    if (existingStockBatch) {
      throw new ConflictException(
        `Cannot update purchase order as stock entry exists for this order. 
         Please delete the existing stock entry and try again.`,
      );
    }

    const newPo = await this.db.transaction(async (trx) => {
      //delete existing items
      await trx
        .delete(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchaseOrderId, id));

      //add new items
      await trx.insert(purchaseOrderItems).values(
        payload.items.map((item) => ({
          purchaseOrderId: id,
          productId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );

      //update po metadata
      const [po] = await trx
        .update(purchaseOrder)
        .set({
          vendorId: payload.vendorId,
          invoiceId: payload.invoiceId,
          orderDate: payload.orderDate,
          totalAmount: payload.totalAmount,
        })
        .where(eq(purchaseOrder.id, id))
        .returning();

      return po;
    });

    return {
      id: newPo.id,
      invoiceId: newPo.invoiceId,
      orderDate: newPo.orderDate,
      status: newPo.status,
      totalAmount: newPo.totalAmount,
      vendor: {
        id: vendor.id,
        name: vendor.name,
      },
      items: payload.items.map((item) => {
        const product = items.find((p) => p.id === item.itemId);
        return {
          id: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: {
            id: product.id,
            name: product.name,
          },
        };
      }),
    };
  }

  async deletePurchaseOrder(id: number) {
    //check for stock entry existence
    const existingStockBatch = await this.getStockBatch(id);
    if (existingStockBatch) {
      throw new ConflictException(
        `Cannot delete purchase order as stock entry exists for this order. 
         Please delete the existing stock entry and try again.`,
      );
    }

    await this.db
      .update(purchaseOrder)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(purchaseOrder.id, id));
  }

  async getStockBatch(poId: number) {
    const [sb] = await this.db
      .select()
      .from(stockBatch)
      .where(
        and(isNull(stockBatch.deletedAt), eq(stockBatch.purchaseOrderId, poId)),
      );

    return sb;
  }
}
