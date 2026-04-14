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
import { CategoryService } from './category.service';
import {
  categoryCreateSchema,
  type TCategoryCreateSchema,
} from '@repo/contracts/category';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { ResponseBuilder } from 'src/lib/response';
import type { PRODUCT_STATUS, STATUS } from '@repo/contracts/status';
import {
  productCreateSchema,
  productUpdateSchema,
  type TProductUpdateSchema,
  type TProductCreateSchema,
} from '@repo/contracts/item';
import { ProductService } from './product.service';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private categoryService: CategoryService,
    private inventoryService: InventoryService,
  ) {}

  @Auth('category.create')
  @Post('/category/create')
  async createCategory(
    @Body(new ZodValidationPipe(categoryCreateSchema))
    categoryDto: TCategoryCreateSchema,
  ) {
    const res = await this.categoryService.createCategory(categoryDto);

    return ResponseBuilder.success(res, 'Category created successfully');
  }

  @Auth('category.read')
  @Get('/category/list')
  async getCategories(
    @Query('query') query: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('status') status?: STATUS,
  ) {
    const res = await this.categoryService.getCategories({
      query,
      limit,
      page,
      status,
    });

    return ResponseBuilder.success(res, 'Categories fetched successfully');
  }

  @Auth('category.read')
  @Get('/category/:id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    const res = await this.categoryService.getCategory(id);

    return ResponseBuilder.success(res, 'Category fetched successfully');
  }

  @Auth('category.update')
  @Patch('/category/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(categoryCreateSchema))
    categoryDto: TCategoryCreateSchema,
  ) {
    const res = await this.categoryService.updateCategory(id, categoryDto);

    return ResponseBuilder.success(res, 'Category updated successfully');
  }

  @Auth('category.delete')
  @Delete('/category/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);

    return ResponseBuilder.success(null, 'Category deleted successfully');
  }

  @Auth('product.create', 'stock.create')
  @Post('/item/create')
  async createItem(
    @Body(new ZodValidationPipe(productCreateSchema))
    productDto: TProductCreateSchema,
  ) {
    const product = await this.inventoryService.createItem(productDto);
  }

  @Auth('product.read', 'stock.read')
  @Get('/item/:id')
  async getItem(@Param('id', ParseIntPipe) id: number) {
    const res = await this.inventoryService.getItem(id);

    return ResponseBuilder.success(res, 'Item fetched successfully');
  }

  @Auth('product.read', 'stock.read')
  @Get('/item/list')
  async getItems(
    @Query('query') query: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('status') status?: PRODUCT_STATUS,
    @Query('category', ParseIntPipe) category?: number,
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

  @Auth('product.update', 'stock.update')
  @Patch('/item/:id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productUpdateSchema))
    productDto: TProductUpdateSchema,
  ) {
    const res = await this.inventoryService.updateItem(id, productDto);

    return ResponseBuilder.success(res, 'Item updated successfully');
  }

  @Auth('product.delete')
  @Delete('/item/:id')
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.inventoryService.deleteItem(id);

    return ResponseBuilder.success(null, 'Item deleted successfully');
  }
}
