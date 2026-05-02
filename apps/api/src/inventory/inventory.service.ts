import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_MODULE, type TDB, type Transaction } from 'src/database/db.module';
import type {
  TProductCreateSchema,
  TProductUpdateSchema,
} from '@repo/contracts/item';
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

  async createItem(itemDto: TProductCreateSchema, trx?: Transaction) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const category = await this.categoryService.getCategory(itemDto.categoryId, tx);
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const product = await this.productService.createProduct(itemDto, tx);
      const stockEntry = await this.stockService.createNewStockEntry({
        productId: product.id,
        quantity: itemDto.currentStock,
        minQuantity: itemDto.minStockLevel,
      }, tx);

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

  async updateItem(id: number, itemDto: TProductUpdateSchema, trx?: Transaction) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const [existingProduct, existingcategory, stockDetails] = await Promise.all(
        [
          this.productService.getProduct(id, tx),
          this.categoryService.getCategory(itemDto.categoryId, tx),
          this.stockService.getStockDetails(id, tx),
        ],
      );

      if (!existingProduct) throw new NotFoundException('Item Not found');
      if (!existingcategory) throw new NotFoundException('Category not found');
      if (!stockDetails) throw new NotFoundException('Stock details not found');

      const item = await this.productService.updateProduct(id, itemDto, tx);
      await this.stockService.updateStockMetadata(id, {
        minQuantity: itemDto.minStockLevel,
      }, tx);
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

  async deleteItem(id: number, trx?: Transaction) {
    const db = trx ?? this.db;
    await db.transaction(async (tx) => {
      const existingProduct = await this.productService.getProduct(id, tx);
      if (!existingProduct) throw new NotFoundException('Item Not found');

      await this.productService.deleteProduct(id, tx);
      await this.stockService.deleteStockEntry(id, tx);
    });
  }
}
