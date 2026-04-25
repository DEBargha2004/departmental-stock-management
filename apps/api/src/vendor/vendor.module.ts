import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { StockProcurementModule } from 'src/stock-procurement/stock-procurement.module';

@Module({
  imports: [StockProcurementModule],
  providers: [VendorService],
  controllers: [VendorController],
  exports: [VendorService],
})
export class VendorModule {}
