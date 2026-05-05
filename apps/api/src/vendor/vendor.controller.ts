import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  type TVendorCreateSchema,
  type TVendorUpdateSchema,
  vendorCreateSchema,
  vendorUpdateSchema,
} from '@repo/contracts/vendor';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { VendorService } from './vendor.service';
import { ResponseBuilder } from 'src/lib/response';
import { Auth } from 'src/authentication/auth.guard';
import type { STATUS } from '@repo/contracts/status';
import { CurrentUser } from 'src/user/user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';

@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Auth('vendor.create')
  @Post('create')
  async createVendor(
    @Body(new ZodValidationPipe(vendorCreateSchema))
    payload: TVendorCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.vendorService.createVendor(payload, user);
    return ResponseBuilder.success(res, 'Vendor created successfully');
  }

  @Auth('vendor.update')
  @Patch(':id')
  async updateVendor(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(vendorUpdateSchema))
    payload: TVendorUpdateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.vendorService.updateVendor(id, payload, user);
    return ResponseBuilder.success(res, 'Vendor updated successfully');
  }

  @Auth('vendor.delete')
  @Delete(':id')
  async deleteVendor(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.vendorService.deleteVendor(id, user);
    return ResponseBuilder.success(null, 'Vendor deleted successfully');
  }

  @Auth('vendor.read')
  @Get('list')
  async getVendors(
    @Query('query') query: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('status') status?: STATUS,
  ) {
    const res = await this.vendorService.getVendors({
      query,
      limit,
      page,
      status,
    });

    return ResponseBuilder.success(res, 'Vendors fetched successfully');
  }

  @Auth('vendor.read')
  @Get(':id')
  async getVendor(@Param('id', ParseIntPipe) id: number) {
    const res = await this.vendorService.getVendor(id);
    return ResponseBuilder.success(res, 'Vendor fetched successfully');
  }
}
