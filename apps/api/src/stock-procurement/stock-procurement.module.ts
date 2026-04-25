import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/db.module';
import { StockProcurementService } from './stock-procurement.service';

@Module({
  imports: [DatabaseModule],
  providers: [StockProcurementService],
  exports: [StockProcurementService],
})
export class StockProcurementModule {}
