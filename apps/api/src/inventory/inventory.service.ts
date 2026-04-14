import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import type {
  TProductCreateSchema,
  TProductUpdateSchema,
} from '@repo/contracts/item';
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  max,
  or,
  sql,
} from 'drizzle-orm';
import { product } from './product.schema';
import { category } from './category.schema';
import { purchaseOrder, stock } from './inventory.schema';
import { TProductQuery } from '@repo/contracts/query';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { StockService } from './stock.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private categoryService: CategoryService,
    private productService: ProductService,
    private stockService: StockService,
  ) {}

  async createItem(itemDto: TProductCreateSchema) {
    const category = await this.categoryService.getCategory(itemDto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = await this.productService.createProduct(itemDto);
    const stockEntry = await this.stockService.createNewStockEntry({
      productId: product.id,
      quantity: itemDto.currentStock,
      minQuantity: itemDto.minStockLevel,
    });

    return { product, stock: stockEntry };
  }

  async getItem(id: number) {
    const it = await this.productService.getProduct(id);

    if (!it) throw new NotFoundException('Item not found');

    return it;
  }

  async getItems(query: TProductQuery) {
    const { list, count } = await this.productService.getProducts(query);

    return { list, count };
  }

  async updateItem(id: number, itemDto: TProductUpdateSchema) {
    const [existingProduct, existingcategory, stockDetails] = await Promise.all(
      [
        this.productService.getProduct(id),
        this.categoryService.getCategory(itemDto.categoryId),
        this.stockService.getStockDetails(id),
      ],
    );

    if (!existingProduct) throw new NotFoundException('Item Not found');
    if (!existingcategory) throw new NotFoundException('Category not found');
    if (!stockDetails) throw new NotFoundException('Stock details not found');

    const item = await this.productService.updateProduct(id, itemDto);
    await this.stockService.updateStockMetadata(id, {
      minQuantity: itemDto.minStockLevel,
    });

    return item;
  }

  async deleteItem(id: number) {
    await this.productService.deleteProduct(id);
    await this.stockService.deleteStockEntry(id);
  }

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
