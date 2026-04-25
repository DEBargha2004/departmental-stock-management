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
import { InventoryService } from './inventory.service';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import {
  productCreateSchema,
  productUpdateSchema,
  type TProductCreateSchema,
  type TProductUpdateSchema,
} from '@repo/contracts/item';
import { ResponseBuilder } from 'src/lib/response';
import { PRODUCT_STATUS } from '@repo/contracts/status';

@Controller('item')
export class ItemController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Auth('product.create', 'stock.create')
  @Post('create')
  async createItem(
    @Body(new ZodValidationPipe(productCreateSchema))
    productDto: TProductCreateSchema,
  ) {
    const res = await this.inventoryService.createItem(productDto);

    return ResponseBuilder.success(res, 'Item created successfully');
  }

  @Auth('product.read', 'stock.read')
  @Get('list')
  async getItems(
    @Query('query') query: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('status') status?: PRODUCT_STATUS,
    @Query('category', new ParseIntPipe({ optional: true })) category?: number,
  ) {
    const res = await this.inventoryService.getItems({
      query,
      limit,
      page,
      status,
      category,
    });

    return ResponseBuilder.success(res, 'Items fetched successfully');
  }

  @Auth('product.read', 'stock.read')
  @Get(':id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    const res = await this.inventoryService.getItem(id);

    return ResponseBuilder.success(res, 'Item fetched successfully');
  }

  @Auth('product.update', 'stock.update')
  @Patch(':id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productUpdateSchema))
    productDto: TProductUpdateSchema,
  ) {
    const res = await this.inventoryService.updateItem(id, productDto);

    return ResponseBuilder.success(res, 'Item updated successfully');
  }

  @Auth('product.delete')
  @Delete(':id')
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.inventoryService.deleteItem(id);

    return ResponseBuilder.success(null, 'Item deleted successfully');
  }
}
