import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './verdor.serice';

@Module({
  providers: [VendorService],
  controllers: [VendorController],
})
export class VendorModule {}
