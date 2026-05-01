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

@Controller('stock-batch')
export class StockBatchController {
  constructor(private readonly stockBatchService: StockBatchService) {}

  @Auth('stock-batch.read')
  @Get(':id')
  async getStockBatch(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockBatchService.getStockBatch(id);

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
  ) {}

  @Auth('stock-batch.update')
  @Patch(':id')
  async updateStockBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(stockBatchCreateSchema))
    data: TStockBatchCreateSchema,
  ) {}

  @Auth('stock-batch.delete')
  @Delete(':id')
  async deleteStockBatch(@Param('id', ParseIntPipe) id: number) {}
}
