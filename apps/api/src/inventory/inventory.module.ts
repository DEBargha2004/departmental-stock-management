import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { StockService } from './stock.service';

@Module({
  controllers: [InventoryController],
  providers: [ProductService, CategoryService, InventoryService, StockService],
  exports: [InventoryService],
})
export class InventoryModule {}
