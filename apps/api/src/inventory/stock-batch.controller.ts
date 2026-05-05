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
import { StockBatchService } from './stock-batch.service';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import {
  stockBatchCreateSchema,
  type TStockBatchCreateSchema,
} from '@repo/contracts/stock-batch';
import { ResponseBuilder } from 'src/lib/response';
import { InventoryService } from './inventory.service';
import { CurrentUser } from 'src/user/user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';

@Controller('stock-batch')
export class StockBatchController {
  constructor(
    private readonly stockBatchService: StockBatchService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Auth('stock-batch.read')
  @Get(':id')
  async getStockBatch(@Param('id', ParseIntPipe) id: number) {
    const data = await this.inventoryService.getDetailedStockBatch(id);

    return ResponseBuilder.success(data, 'Stock batch fetched successfully');
  }

  @Auth('stock-batch.read')
  @Get()
  async getStockBatches(
    @Query('query') query?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('vendorId', new ParseIntPipe({ optional: true })) vendorId?: number,
  ) {
    const res = await this.stockBatchService.getStockBatches({
      query,
      limit,
      page,
      vendorId,
    });

    return ResponseBuilder.success(res, 'Stock batches fetched successfully');
  }

  @Auth('stock-batch.create')
  @Post()
  async createStockBatch(
    @Body(new ZodValidationPipe(stockBatchCreateSchema))
    data: TStockBatchCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.createStockBatch(data, user);

    return ResponseBuilder.success(null, 'Stock batch created successfully');
  }

  @Auth('stock-batch.update')
  @Patch(':id')
  async updateStockBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(stockBatchCreateSchema))
    data: TStockBatchCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.updateStockBatch(id, data, user);

    return ResponseBuilder.success(null, 'Stock batch updated successfully');
  }

  @Auth('stock-batch.delete')
  @Delete(':id')
  async deleteStockBatch(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.deleteStockBatch(id, user);

    return ResponseBuilder.success(null, 'Stock batch deleted successfully');
  }
}
