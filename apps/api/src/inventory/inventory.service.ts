import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import type {
  TProductCreateSchema,
  TProductUpdateSchema,
} from '@repo/contracts/item';
import { TProductQuery } from '@repo/contracts/query';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { StockService, TProductForStockDetails } from './stock.service';
import { AuditService } from 'src/audit/audit.service';
import type { TJWTPayload } from 'src/authentication/auth.service';
import {
  TPurchaseOrder,
  TPurchaseOrderCreateSchema,
  TPurchaseOrderUpdateSchema,
} from '@repo/contracts/purchase-order';
import { PurchaseOrderService } from './purchase-order.service';
import { VendorService } from 'src/vendor/vendor.service';
import { StockBatchService } from './stock-batch.service';
import {
  TStockBatchCreateSchema,
  TStockBatchUpdateSchema,
} from '@repo/contracts/stock-batch';
import {
  TIssueRequestCreateSchema,
  TIssueRequestItem,
  TIssueRequestUpdateSchema,
  TReturnRequestCreateSchema,
  TReturnRequestItem,
  TReturnRequestUpdateSchema,
} from '@repo/contracts/circulation';
import { UserService } from 'src/user/user.service';
import { CirculationService } from './circulation.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(DATABASE_MODULE) private readonly db: TDB,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    private readonly auditService: AuditService,
    private readonly vendorService: VendorService,
    private readonly stockBatchService: StockBatchService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly userService: UserService,
    private readonly circulationService: CirculationService,
  ) {}

  async createItem(
    itemDto: TProductCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const category = await this.categoryService.getCategory(
        itemDto.categoryId,
        tx,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const product = await this.productService.createProduct(itemDto, tx);
      const stockEntry = await this.stockService.createNewStockEntry(
        {
          productId: product.id,
          quantity: itemDto.currentStock,
          minQuantity: itemDto.minStockLevel,
        },
        tx,
      );
      await this.stockService.createStockMovement(
        [
          {
            productId: product.id,
            quantity: itemDto.currentStock,
            movementType: 'initial',
            reference: `Initial stock for product ${product.id}`,
          },
        ],
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: product.id,
          entityType: 'product',
          description: `Created product with id ${product.id}`,
          userId: user.id,
        },
        tx,
      );

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
        },
        stock: {
          quantity: stockEntry.quantityAvailable,
          minStockLevel: stockEntry.minStockLevel,
        },
      };
    });
  }

  async getItem(id: number, trx?: Transaction) {
    const it = await this.productService.getProduct(id, trx);

    if (!it) throw new NotFoundException('Item not found');

    return it;
  }

  async getItems(query: TProductQuery, trx?: Transaction) {
    const { list, count } = await this.productService.getProducts(query, trx);

    return { list, count };
  }

  async updateItem(
    id: number,
    itemDto: TProductUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const [existingProduct, existingcategory, stockDetails] =
        await Promise.all([
          this.productService.getProduct(id, tx),
          this.categoryService.getCategory(itemDto.categoryId, tx),
          this.stockService.getStockDetails(id, tx),
        ]);

      if (!existingProduct) throw new NotFoundException('Item Not found');
      if (!existingcategory) throw new NotFoundException('Category not found');
      if (!stockDetails) throw new NotFoundException('Stock details not found');

      const item = await this.productService.updateProduct(id, itemDto, tx);
      await this.stockService.updateStockMetadata(
        [
          {
            productId: existingProduct.id,
            payload: {
              minStockLevel: itemDto.minStockLevel,
            },
          },
        ],
        tx,
      );
      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'product',
          description: `Updated product with id ${id}`,
          userId: user.id,
        },
        tx,
      );
      const pr = await this.categoryService.getCategory(itemDto.categoryId, tx);

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        category: {
          id: pr!.id,
          name: pr!.name,
          description: pr!.description,
        },
        stock: {
          quantity: stockDetails.quantityAvailable,
          minStockLevel: itemDto.minStockLevel,
        },
      };
    });
  }

  async deleteItem(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.transaction(async (tx) => {
      const existingProduct = await this.productService.getProduct(id, tx);
      if (!existingProduct) throw new NotFoundException('Item Not found');

      await this.productService.deleteProduct(id, tx);
      await this.stockService.deleteStockEntry(id, tx);
      await this.stockService.createStockMovement(
        [
          {
            productId: id,
            quantity: 0,
            movementType: 'adjustment',
            reference: `Product ${id} deleted, stock entry removed`,
          },
        ],
        tx,
      );
      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'product',
          description: `Deleted product with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async createPurchaseOrder(
    payload: TPurchaseOrderCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ): Promise<TPurchaseOrder> {
    const db = trx ?? this.db;

    const po = await db.transaction(async (tx) => {
      //check for vendor
      const vendor = await this.vendorService.getVendor(payload.vendorId, tx);
      if (!vendor) throw new NotFoundException('Vendor not found');

      const items = await Promise.all(
        payload.items.map((item) =>
          this.productService.getProduct(item.itemId, tx),
        ),
      );

      //check for existence
      if (items.some((it) => !it)) {
        throw new NotFoundException('One or more items not found');
      }

      const po = await this.purchaseOrderService.createPurchaseOrder(
        payload,
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: po.entry.id,
          entityType: 'purchase_order',
          description: `Created purchase order with id ${po.entry.id}`,
          userId: user.id,
        },
        tx,
      );

      return {
        entry: po.entry,
        items: po.items,
        vendor,
        productDetails: items,
      };
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
        const product = po.productDetails.find(
          (p) => p!.id === poItem.productId,
        );
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

  async updatePurchaseOrder(
    id: number,
    payload: TPurchaseOrderUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      //check for existence
      const po = await this.purchaseOrderService.getPurchaseOrder(id, tx);
      if (!po) throw new NotFoundException('Purchase order not found');

      //check for vendor
      const vendor = await this.vendorService.getVendor(payload.vendorId, tx);
      if (!vendor) throw new NotFoundException('Vendor not found');

      const items = await Promise.all(
        payload.items.map((item) =>
          this.productService.getProduct(item.itemId, tx),
        ),
      );

      //check for existence
      if (items.some((it) => !it)) {
        throw new NotFoundException('One or more items not found');
      }

      //check for if stock entry exists for the items, if yes then block update
      //as it can lead to data inconsistency. User has to manually delete and create new PO in that case
      const existingStockBatch = await this.stockBatchService.getStockBatch(
        id,
        tx,
      );
      if (existingStockBatch) {
        throw new ConflictException(
          `Cannot update purchase order as stock entry exists for this order. 
             Please delete the existing stock entry and try again.`,
        );
      }

      await this.purchaseOrderService.updatePurchaseOrder(id, payload, tx);
      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'purchase_order',
          description: `Updated purchase order with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async deletePurchaseOrder(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      //check for stock entry existence
      const existingStockBatch = await this.stockBatchService.getStockBatch(
        id,
        tx,
      );
      if (existingStockBatch) {
        throw new ConflictException(
          `Cannot delete purchase order as stock entry exists for this order. 
             Please delete the existing stock entry and try again.`,
        );
      }

      await this.purchaseOrderService.deletePurchaseOrder(id, tx);
      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'purchase_order',
          description: `Deleted purchase order with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async createStockBatch(
    payload: TStockBatchCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const po = await this.purchaseOrderService.getPurchaseOrder(
        payload.purchaseOrderId,
        trx,
      );

      if (!po) {
        throw new NotFoundException(
          `Purchase order with id ${payload.purchaseOrderId} not found`,
        );
      }

      // check po status
      if (po.order.status === 'cancelled' || po.order.status === 'received') {
        throw new BadRequestException(
          `Cannot create stock batch for purchase order with status ${po.order.status}`,
        );
      }

      //check if stock batch already exists for this po
      const existingBatch =
        await this.stockBatchService.getStockBatchByPurchaseOrder(
          po.order.id,
          trx,
        );

      if (existingBatch) {
        throw new BadRequestException(
          `Stock batch already exists for purchase order with id ${po.order.id}`,
        );
      }

      //check if arrival date is before order date
      if (new Date(payload.arrivalDate) < new Date(po.order.orderDate)) {
        throw new BadRequestException(
          `Arrival date cannot be before order date (${po.order.orderDate})`,
        );
      }

      // check if products in items are valid and belong to the po
      const isItemsIncluded = payload.purchaseItems.every((item) =>
        po.order.items.some((poItem) => poItem.id === item.purchaseItemId),
      );

      if (!isItemsIncluded) {
        throw new BadRequestException(
          `All purchase items must belong to the purchase order with id ${po.order.id}`,
        );
      }

      const stockList = await this.stockService.getStockDetailsList(
        po.order.items.map((item) => item.product.id),
        tx,
      );

      const batch = await this.stockBatchService.createStockBatch(payload, tx);

      await this.purchaseOrderService.updatePurchaseOrderStatus(
        po.order.id,
        'received',
        tx,
      );

      await this.stockService.createStockMovement(
        payload.purchaseItems.map((item) => {
          const poItem = po.order.items.find(
            (poIt) => poIt.id === item.purchaseItemId,
          )!;
          return {
            productId: poItem.product.id,
            quantity: item.quantityReceived,
            movementType: 'new_stock',
            reference: `Stock batch ${batch.id} created for purchase order ${po.order.id}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        payload.purchaseItems.map((item) => {
          const poItem = po.order.items.find(
            (poIt) => poIt.id === item.purchaseItemId,
          )!;
          const existingStock = stockList.find(
            (stock) => stock.product.id === poItem.product.id,
          )!;
          const totalQuantity =
            item.quantityReceived + existingStock.quantityAvailable;

          return {
            productId: poItem.product.id,
            payload: {
              quantityAvailable: totalQuantity,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: batch.id,
          entityType: 'stock_batch',
          description: `Created stock batch for purchase order ${payload.purchaseOrderId}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async getDetailedStockBatch(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    const sb = await this.stockBatchService.getStockBatch(id, trx);

    const po = await this.purchaseOrderService.getPurchaseOrder(
      sb.purchaseOrder.id,
      trx,
    );
    return {
      batch: sb,
      list: {
        purchaseOrder: [po],
      },
    };
  }

  async updateStockBatch(
    id: number,
    payload: TStockBatchUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const sb = await this.stockBatchService.getStockBatch(id, tx);

      if (!sb) {
        throw new NotFoundException(`Stock batch with id ${id} not found`);
      }

      const po = await this.purchaseOrderService.getPurchaseOrder(
        payload.purchaseOrderId,
        tx,
      );

      if (!po) {
        throw new NotFoundException(
          `Purchase order with id ${payload.purchaseOrderId} not found`,
        );
      }

      //check if arrival date is before order date
      if (new Date(payload.arrivalDate) < new Date(po.order.orderDate)) {
        throw new BadRequestException(
          `Arrival date cannot be before order date (${po.order.orderDate})`,
        );
      }

      // check if products in items are valid and belong to the po
      const isItemsIncluded = payload.purchaseItems.every((item) =>
        po.order.items.some((poItem) => poItem.id === item.purchaseItemId),
      );

      if (!isItemsIncluded) {
        throw new BadRequestException(
          `All purchase items must belong to the purchase order with id ${po.order.id}`,
        );
      }

      const stockList = await this.stockService.getStockDetailsList(
        po.order.items.map((i) => i.product.id),
        tx,
      );

      await this.stockBatchService.updateStockBatch(id, payload, tx);
      await this.stockService.createStockMovement(
        payload.purchaseItems.map((item) => {
          const poItem = po.order.items.find(
            (poIt) => poIt.id === item.purchaseItemId,
          )!;
          const sbItem = sb.items.find(
            (it) => it.purchaseOrderItemId === item.purchaseItemId,
          )!;
          const quantityDelta = sbItem.quantity - item.quantityReceived;
          return {
            productId: poItem.product.id,
            movementType: 'adjustment',
            quantity: quantityDelta,
            reference: `Stock batch ${id} updated for purchase order ${po.order.id}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        payload.purchaseItems.map((item) => {
          const poItem = po.order.items.find(
            (poIt) => poIt.id === item.purchaseItemId,
          )!;
          const sbItem = sb.items.find(
            (it) => it.purchaseOrderItemId === item.purchaseItemId,
          )!;

          const currentStock = stockList.find(
            (s) => s.product.id === poItem.product.id,
          );

          const quantityDelta = item.quantityReceived - sbItem.quantity;

          return {
            productId: poItem.product.id,
            payload: {
              quantityAvailable: currentStock.quantityAvailable + quantityDelta,
            },
          };
        }),
        tx,
      );
      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'stock_batch',
          description: `Updated stock batch with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async deleteStockBatch(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const existingBatch = await this.stockBatchService.getStockBatch(id, tx);
      if (!existingBatch) {
        throw new NotFoundException(`Stock batch with id ${id} not found`);
      }

      const stockList = await this.stockService.getStockDetailsList(
        existingBatch.items.map((i) => i.product.id),
        tx,
      );

      await this.stockBatchService.deleteStockBatch(id, tx);

      await this.purchaseOrderService.updatePurchaseOrderStatus(
        existingBatch.purchaseOrder.id,
        'ordered',
        tx,
      );
      await this.stockService.createStockMovement(
        existingBatch.items.map((item) => {
          return {
            productId: item.product.id,
            quantity: -item.quantity,
            movementType: 'adjustment',
            reference: `Stock batch ${id} deleted for purchase order ${existingBatch.purchaseOrder.id}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        existingBatch.items.map((item) => {
          const stock = stockList.find(
            (s) => s.product.id === item.product.id,
          )!;

          return {
            productId: item.product.id,
            payload: {
              quantityAvailable: stock.quantityAvailable - item.quantity,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'stock_batch',
          description: `Deleted stock batch with id ${id}`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async createIssueRequest(
    data: TIssueRequestCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const issuedToInfo = await this.userService.getUserById(data.userId, tx);
      if (!issuedToInfo) {
        throw new NotFoundException(`User with id ${data.userId} not found`);
      }

      const stockList = await this.stockService.getStockDetailsList(
        data.items.map((i) => i.itemId),
        tx,
      );

      const nonExistingProducts: TProductForStockDetails[] = [];

      // check for existance of product
      for (const item of data.items) {
        const stock = stockList.find((s) => s.product.id === item.itemId);
        if (!stock) {
          nonExistingProducts.push(stock.product);
        }
      }

      if (nonExistingProducts.length > 0) {
        throw new NotFoundException(
          `Product ${nonExistingProducts.map((p) => p.name).join(', ')} not found`,
        );
      }

      const insufficientStockProducts: TProductForStockDetails[] = [];

      for (const item of data.items) {
        const stock = stockList.find((s) => s.product.id === item.itemId)!;
        if (stock.quantityAvailable < item.quantity) {
          insufficientStockProducts.push(stock.product);
        }
      }

      if (insufficientStockProducts.length > 0) {
        throw new NotFoundException(
          `Insufficient stock for products ${insufficientStockProducts.map((p) => p.name).join(', ')}`,
        );
      }

      const consumables = stockList
        .filter((s) => s.product.isConsumable)
        .map((s) => s.product.id);

      const issueRequest = await this.circulationService.createIssueRequest(
        data,
        consumables,
        user,
        tx,
      );

      await this.stockService.createStockMovement(
        data.items.map((item) => {
          return {
            productId: item.itemId,
            quantity: -item.quantity,
            movementType: 'issue',
            reference: `Issue request ${issueRequest.id}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        data.items.map((item) => {
          const stock = stockList.find((s) => s.product.id === item.itemId)!;

          return {
            productId: item.itemId,
            payload: {
              quantityAvailable: stock.quantityAvailable - item.quantity,
              quantityIssued: stock.quantityIssued + item.quantity,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: issueRequest.id,
          entityType: 'issue_request',
          description: `Issue request ${issueRequest.id} created`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async getIssueRequest(id: number, trx?: Transaction) {
    const db = trx ?? this.db;

    return await db.transaction(async (tx) => {
      const issueRequest = await this.circulationService.getIssueRequest(
        id,
        tx,
      );
      if (!issueRequest) {
        throw new NotFoundException(`Issue request with id ${id} not found`);
      }

      const [userInfo, productsInfo] = await Promise.all([
        this.userService.getUserById(issueRequest.issuedTo.id, tx),
        this.productService.getProductList(
          issueRequest.items.map((i) => i.product.id),
          tx,
        ),
      ]);

      return {
        request: issueRequest,
        list: {
          user: userInfo,
          products: productsInfo,
        },
      };
    });
  }

  async updateIssueRequest(
    id: number,
    data: TIssueRequestUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    return await db.transaction(async (tx) => {
      const issueRequest = await this.circulationService.getIssueRequest(
        id,
        tx,
      );
      if (!issueRequest) {
        throw new NotFoundException(`Issue request with id ${id} not found`);
      }

      const returnRequests =
        await this.circulationService.getReturnRequestByIssueCode(
          issueRequest.issueCode,
          tx,
        );

      if (returnRequests.length > 0) {
        throw new ConflictException(
          `Issue request with id ${id} has return requests`,
        );
      }

      const stockList = await this.stockService.getStockDetailsList(
        issueRequest.items.map((i) => i.product.id),
        tx,
      );

      const nonExistingProducts: TProductForStockDetails[] = [];

      // check for existance of product
      for (const item of data.items) {
        const stock = stockList.find((s) => s.product.id === item.itemId);
        if (!stock) {
          nonExistingProducts.push(stock.product);
        }
      }

      if (nonExistingProducts.length > 0) {
        throw new NotFoundException(
          `Product ${nonExistingProducts.map((p) => p.name).join(', ')} not found`,
        );
      }

      const insufficientStockProducts: TProductForStockDetails[] = [];

      for (const item of data.items) {
        const stock = stockList.find((s) => s.product.id === item.itemId)!;
        const oldIssueRequestItem = issueRequest.items.find(
          (i) => i.product.id === item.itemId,
        );

        if (
          stock.quantityAvailable + oldIssueRequestItem.quantity <
          item.quantity
        ) {
          insufficientStockProducts.push(stock.product);
        }
      }

      if (insufficientStockProducts.length > 0) {
        throw new NotFoundException(
          `Insufficient stock for products ${insufficientStockProducts.map((p) => p.name).join(', ')}`,
        );
      }

      const consumables = stockList
        .filter((s) => s.product.isConsumable)
        .map((s) => s.product.id);

      await this.circulationService.updateIssueRequest(
        id,
        data,
        consumables,
        user,
        tx,
      );

      // reverse old issue stock movement
      await this.stockService.createStockMovement(
        issueRequest.items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          movementType: 'adjustment',
          reference: `Issue request ${id}`,
        })),
        tx,
      );

      // revert old issue stock metadata
      await this.stockService.updateStockMetadata(
        issueRequest.items.map((item) => {
          const stock = stockList.find(
            (s) => s.product.id === item.product.id,
          )!;

          return {
            productId: item.product.id,
            payload: {
              quantityAvailable: stock.quantityAvailable + item.quantity,
              quantityIssued: stock.quantityIssued - item.quantity,
            },
          };
        }),
        tx,
      );

      // add new issue stock movement
      await this.stockService.createStockMovement(
        data.items.map((it) => ({
          productId: it.itemId,
          quantity: -it.quantity,
          movementType: 'issue',
          reference: `Issue request ${id}`,
        })),
        tx,
      );

      // add new issue stock metadata
      await this.stockService.updateStockMetadata(
        data.items.map((item) => {
          const stock = stockList.find((s) => s.product.id === item.itemId)!;
          const oldIssueRequestItem = issueRequest.items.find(
            (i) => i.product.id === item.itemId,
          );

          return {
            productId: item.itemId,
            payload: {
              quantityAvailable:
                stock.quantityAvailable +
                (oldIssueRequestItem?.quantity ?? 0) -
                item.quantity,
              quantityIssued:
                stock.quantityIssued -
                (oldIssueRequestItem?.quantity ?? 0) +
                item.quantity,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'issue_request',
          description: `Issue request ${id} updated`,
          userId: user.id,
        },
        tx,
      );

      return {
        message: `Issue request with id ${id} updated successfully`,
      };
    });
  }

  async deleteIssueRequest(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;

    return await db.transaction(async (tx) => {
      const issueRequest = await this.circulationService.getIssueRequest(
        id,
        tx,
      );
      if (!issueRequest) {
        throw new NotFoundException(`Issue request with id ${id} not found`);
      }

      const returnRequests =
        await this.circulationService.getReturnRequestByIssueCode(
          issueRequest.issueCode,
          trx,
        );
      if (returnRequests.length > 0) {
        throw new ConflictException(
          `Issue request with id ${id} has return requests`,
        );
      }

      const stockList = await this.stockService.getStockDetailsList(
        issueRequest.items.map((i) => i.product.id),
        tx,
      );

      await this.circulationService.deleteIssueRequest(id, tx);
      await this.stockService.createStockMovement(
        issueRequest.items.map((item) => {
          return {
            productId: item.product.id,
            quantity: item.quantity,
            movementType: 'adjustment',
            reference: `Issue request ${id} deleted`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        issueRequest.items.map((item) => {
          const stock = stockList.find(
            (s) => s.product.id === item.product.id,
          )!;

          return {
            productId: item.product.id,
            payload: {
              quantityAvailable: stock.quantityAvailable + item.quantity,
              quantityIssued: stock.quantityIssued - item.quantity,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'issue_request',
          description: `Issue request ${id} deleted`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async createReturnRequest(
    data: TReturnRequestCreateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const issueRequest = await this.circulationService.getIssueRequest(
        data.issueRequestId,
        tx,
      );

      if (!issueRequest) {
        throw new NotFoundException(
          `Issue request with id ${data.issueRequestId} not found`,
        );
      }

      const nonExistingIssueRequestItems: TReturnRequestCreateSchema['items'] =
        [];

      for (const item of data.items) {
        const existingItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );
        if (!existingItem) {
          nonExistingIssueRequestItems.push(item);
        }
      }

      if (nonExistingIssueRequestItems.length > 0) {
        throw new NotFoundException(
          `Issue request items ${nonExistingIssueRequestItems.map((i) => i.issueItemId).join(', ')} not found`,
        );
      }

      const [stockList, returnRequests] = await Promise.all([
        this.stockService.getStockDetailsList(
          issueRequest.items.map((i) => i.product.id),
          tx,
        ),
        this.circulationService.getReturnRequestByIssueCode(
          issueRequest.issueCode,
          tx,
        ),
      ]);

      const consumables = stockList
        .filter((s) => s.product.isConsumable)
        .map((s) => s.product.id);

      // base for quantity check and update
      const nonConsumableItems = data.items.filter((item) => {
        const existingIssueRequestItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );
        return !consumables.includes(existingIssueRequestItem.product.id);
      });

      const quantityExceededReturnRequests: TIssueRequestItem[] = [];

      for (const item of nonConsumableItems) {
        const issuedItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );

        const totalReturns = returnRequests.reduce((acc, rr) => {
          const oldReturnRequestItem = rr.items.find(
            (i) => i.issueItemId === item.issueItemId,
          );
          return acc + (oldReturnRequestItem?.quantityReceived ?? 0);
        }, 0);

        const quantityDamaged = returnRequests.reduce((acc, rr) => {
          const oldReturnRequestItem = rr.items.find(
            (i) => i.issueItemId === item.issueItemId,
          );
          return acc + (oldReturnRequestItem?.quantityDamaged ?? 0);
        }, 0);

        if (
          issuedItem.quantity - quantityDamaged - totalReturns <
          item.quantityReturned + item.quantityDamaged
        ) {
          quantityExceededReturnRequests.push(issuedItem);
        }
      }

      if (quantityExceededReturnRequests.length > 0) {
        throw new BadRequestException(
          `Return request quantity for items ${quantityExceededReturnRequests.map((i) => i.id).join(', ')} exceeds issue request quantity`,
        );
      }

      await this.circulationService.createReturnRequest(data, user, tx);

      await this.stockService.createStockMovement(
        nonConsumableItems.map((item) => {
          const prod = issueRequest.items.find(
            (i) => i.id === item.issueItemId,
          ).product;
          return {
            productId: prod.id,
            quantity: item.quantityReturned,
            movementType: 'return',
            reference: `Return request ${data.issueRequestId}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        nonConsumableItems.map((item) => {
          const prod = issueRequest.items.find(
            (i) => i.id === item.issueItemId,
          ).product;
          const stock = stockList.find((s) => s.product.id === prod.id)!;

          return {
            productId: prod.id,
            payload: {
              quantityAvailable:
                stock.quantityAvailable + item.quantityReturned,
              quantityIssued: stock.quantityIssued - item.quantityReturned,
              quantityDamaged: stock.quantityDamaged + item.quantityDamaged,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: data.issueRequestId,
          entityType: 'return_request',
          description: `Return request ${data.issueRequestId} created`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async updateReturnRequest(
    id: number,
    data: TReturnRequestUpdateSchema,
    user: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const returnRequest = await this.circulationService.getReturnRequest(
        id,
        tx,
      );
      if (!returnRequest) {
        throw new NotFoundException(`Return request with id ${id} not found`);
      }

      const issueRequest = await this.circulationService.getIssueRequest(
        returnRequest.issueRequestId,
        tx,
      );

      const nonExistingIssueRequestItems: TReturnRequestCreateSchema['items'] =
        [];

      for (const item of data.items) {
        const existingItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );
        if (!existingItem) {
          nonExistingIssueRequestItems.push(item);
        }
      }

      if (nonExistingIssueRequestItems.length > 0) {
        throw new NotFoundException(
          `Issue request items ${nonExistingIssueRequestItems.map((i) => i.issueItemId).join(', ')} not found`,
        );
      }

      const [stockList, returnRequests] = await Promise.all([
        this.stockService.getStockDetailsList(
          issueRequest.items.map((i) => i.product.id),
          tx,
        ),
        this.circulationService.getReturnRequestByIssueCode(
          issueRequest.issueCode,
          tx,
        ),
      ]);

      const consumables = stockList
        .filter((s) => s.product.isConsumable)
        .map((s) => s.product.id);

      // base for quantity check and update
      const nonConsumableItems = data.items.filter((item) => {
        const existingIssueRequestItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );
        return !consumables.includes(existingIssueRequestItem.product.id);
      });
      const existingReturnRequest = returnRequests.find((rr) => rr.id === id);

      const quantityExceededReturnRequests: TIssueRequestItem[] = [];
      for (const item of nonConsumableItems) {
        const existingReturnRequestItem = existingReturnRequest.items.find(
          (i) => i.issueItemId === item.issueItemId,
        );
        const issuedItem = issueRequest.items.find(
          (i) => i.id === item.issueItemId,
        );

        const totalReturns = returnRequests.reduce((acc, rr) => {
          const oldReturnRequestItem = rr.items.find(
            (i) => i.issueItemId === item.issueItemId,
          );
          return acc + (oldReturnRequestItem?.quantityReceived ?? 0);
        }, 0);

        const quantityDamaged = returnRequests.reduce((acc, rr) => {
          const oldReturnRequestItem = rr.items.find(
            (i) => i.issueItemId === item.issueItemId,
          );
          return acc + (oldReturnRequestItem?.quantityDamaged ?? 0);
        }, 0);

        // checking if the new return request exceeds the issue request quantity
        if (
          issuedItem.quantity -
            quantityDamaged -
            totalReturns +
            existingReturnRequestItem.quantityReceived -
            existingReturnRequestItem.quantityDamaged <
          item.quantityReturned + item.quantityDamaged
        ) {
          quantityExceededReturnRequests.push(issuedItem);
        }
      }

      if (quantityExceededReturnRequests.length > 0) {
        throw new BadRequestException(
          `Return request quantity for items ${quantityExceededReturnRequests.map((i) => i.id).join(', ')} exceeds issue request quantity`,
        );
      }

      await this.circulationService.updateReturnRequest(id, data, tx);

      // revert previous movements of this return request and create new ones
      await this.stockService.createStockMovement(
        existingReturnRequest.items.map((item) => {
          return {
            productId: item.product.id,
            quantity: -item.quantityReceived,
            movementType: 'return',
            reference: `Return request ${existingReturnRequest.issueRequestId}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        existingReturnRequest.items.map((item) => {
          const stock = stockList.find(
            (s) => s.product.id === item.product.id,
          )!;
          return {
            productId: item.product.id,
            payload: {
              quantityAvailable:
                stock.quantityAvailable - item.quantityReceived,
              quantityIssued: stock.quantityIssued + item.quantityReceived,
              quantityDamaged: stock.quantityDamaged - item.quantityDamaged,
            },
          };
        }),
        tx,
      );

      await this.stockService.createStockMovement(
        nonConsumableItems.map((item) => {
          const existingIssueRequestItem = issueRequest.items.find(
            (i) => i.id === item.issueItemId,
          );
          return {
            productId: existingIssueRequestItem.product.id,
            quantity: item.quantityReturned,
            movementType: 'return',
            reference: `Return request ${data.issueRequestId}`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        nonConsumableItems.map((item) => {
          const existingReturnRequestItem = existingReturnRequest.items.find(
            (i) => i.id === item.issueItemId,
          );
          const stock = stockList.find(
            (s) => s.product.id === existingReturnRequestItem.product.id,
          )!;
          return {
            productId: existingReturnRequestItem.product.id,
            payload: {
              quantityAvailable:
                stock.quantityAvailable -
                existingReturnRequestItem.quantityReceived +
                item.quantityReturned,
              quantityIssued:
                stock.quantityIssued +
                existingReturnRequestItem.quantityReceived -
                item.quantityReturned,
              quantityDamaged:
                stock.quantityDamaged -
                existingReturnRequestItem.quantityDamaged +
                item.quantityDamaged,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: id,
          entityType: 'return_request',
          description: `Return request ${id} updated`,
          userId: user.id,
        },
        tx,
      );
    });
  }

  async deleteReturnRequest(id: number, user: TJWTPayload, trx?: Transaction) {
    const db = trx ?? this.db;

    await db.transaction(async (tx) => {
      const returnRequest = await this.circulationService.getReturnRequest(
        id,
        tx,
      );
      if (!returnRequest) {
        throw new NotFoundException(`Return request with id ${id} not found`);
      }

      const stockList = await this.stockService.getStockDetailsList(
        returnRequest.items.map((i) => i.product.id),
        tx,
      );

      await this.circulationService.deleteReturnRequest(id, tx);

      await this.stockService.createStockMovement(
        returnRequest.items.map((item) => {
          return {
            productId: item.product.id,
            quantity: item.quantityReceived,
            movementType: 'adjustment',
            reference: `Return request ${id} deleted`,
          };
        }),
        tx,
      );

      await this.stockService.updateStockMetadata(
        returnRequest.items.map((item) => {
          const stock = stockList.find(
            (s) => s.product.id === item.product.id,
          )!;

          return {
            productId: item.product.id,
            payload: {
              quantityAvailable:
                stock.quantityAvailable - item.quantityReceived,
              quantityIssued: stock.quantityIssued + item.quantityReceived,
              quantityDamaged: stock.quantityDamaged - item.quantityDamaged,
            },
          };
        }),
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: id,
          entityType: 'return_request',
          description: `Return request ${id} deleted`,
          userId: user.id,
        },
        tx,
      );
    });
  }
}
