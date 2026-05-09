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
import { StockBatchController } from './stock-batch.controller';
import { StockBatchService } from './stock-batch.service';
import { AuditModule } from 'src/audit/audit.module';
import { CirculationController } from './circulation.controller';
import { CirculationService } from './circulation.service';

@Module({
  controllers: [
    CategoryController,
    ItemController,
    PurchaseOrderController,
    StockBatchController,
    CirculationController,
  ],
  imports: [VendorModule, AuditModule],
  providers: [
    ProductService,
    CategoryService,
    InventoryService,
    StockService,
    PurchaseOrderService,
    StockBatchService,
    CirculationService,
  ],
  exports: [InventoryService, PurchaseOrderService],
})
export class InventoryModule {}
