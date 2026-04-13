import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CategoryService } from './category.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, CategoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
