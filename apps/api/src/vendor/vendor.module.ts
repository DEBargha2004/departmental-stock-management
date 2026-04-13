import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [VendorService],
  controllers: [VendorController],
})
export class VendorModule {}
