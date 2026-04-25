import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { StockService } from './stock.service';
import { PurchaseOrderService } from './purchase-order.service';
import { VendorModule } from 'src/vendor/vendor.module';
import { CategoryController } from './category.controller';
import { ItemController } from './item.controller';
import { PurchaseOrderController } from './purchase-order.controller';

@Module({
  controllers: [CategoryController, ItemController, PurchaseOrderController],
  imports: [VendorModule],
  providers: [
    ProductService,
    CategoryService,
    InventoryService,
    StockService,
    PurchaseOrderService,
  ],
  exports: [InventoryService, PurchaseOrderService],
})
export class InventoryModule {}
