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
import type { Status } from '@repo/contracts/status';

@Controller('inventory')
export class InventoryController {
  constructor(private categoryService: CategoryService) {}

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
    @Query('status') status?: Status,
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

  @Auth('auth.update')
  @Patch('/category/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(categoryCreateSchema))
    categoryDto: TCategoryCreateSchema,
  ) {
    const res = await this.categoryService.updateCategory(id, categoryDto);

    return ResponseBuilder.success(res, 'Category updated successfully');
  }

  @Auth('auth.delete')
  @Delete('/category/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);

    return ResponseBuilder.success(null, 'Category deleted successfully');
  }
}
