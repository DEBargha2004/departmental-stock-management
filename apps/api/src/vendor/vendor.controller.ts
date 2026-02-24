import { Body, Controller, ParseIntPipe, Post } from '@nestjs/common';
import { filter, type TFilter } from '@repo/contracts/filter';
import {
  type TVendor,
  type TVendorUpdate,
  vendorSchema,
  vendorUpdateSchema,
} from '@repo/contracts/vendor';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { VendorService } from './vendor.service';
import { ResponseBuilder } from 'src/lib/response';

@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Post('create')
  async createVendor(
    @Body(new ZodValidationPipe(vendorSchema)) payload: TVendor,
  ) {
    const res = await this.vendorService.createVendor(payload);
    return ResponseBuilder.success(res, 'Vendor created successfully');
  }

  async updateVendor(
    @Body(new ZodValidationPipe(vendorUpdateSchema)) payload: TVendorUpdate,
  ) {
    const res = await this.vendorService.updateVendor(payload.id, payload.data);
    return ResponseBuilder.success(res, 'Vendor updated successfully');
  }

  async deleteVendor(@Body('id', ParseIntPipe) id: number) {
    await this.vendorService.deleteVendor(id);
    return ResponseBuilder.success(null, 'Vendor deleted successfully');
  }

  async getVendor(@Body('id', ParseIntPipe) id: number) {
    const res = await this.vendorService.getVendor(id);
    return res;
  }

  async getVendors(
    @Body('filter', new ZodValidationPipe(filter)) filter: TFilter,
  ) {
    const res = await this.vendorService.getVendors(filter);
    return res;
  }
}
