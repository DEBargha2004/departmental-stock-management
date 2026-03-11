import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import type { TCategoryCreateSchema } from '@repo/contracts/category';
import type { TItemCreateSchema } from '@repo/contracts/item';
import { category, item, stock } from './inventory.schema';

@Injectable()
export class InventoryService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createCategory(categoryDto: TCategoryCreateSchema) {
    return await this.db
      .insert(category)
      .values({
        name: categoryDto.name,
      })
      .returning();
  }

  async createItem(itemDto: TItemCreateSchema) {
    return await this.db.transaction(async (trx) => {
      const [res] = await this.db
        .insert(item)
        .values({
          name: itemDto.name,
          categoryId: itemDto.categoryId,
          minStockLevel: itemDto.minStockLevel,
          status: itemDto.status,
          imageUrl: itemDto.imageUrl,
        })
        .returning();

      await this.db.insert(stock).values({
        itemId: res.id,
      });

      return res;
    });
  }
}
