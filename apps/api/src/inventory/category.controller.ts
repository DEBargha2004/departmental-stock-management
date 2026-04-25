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
  categoryCreateSchema,
  type TCategoryCreateSchema,
} from '@repo/contracts/category';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { CategoryService } from './category.service';
import { ResponseBuilder } from 'src/lib/response';
import type { STATUS } from '@repo/contracts/status';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth('category.create')
  @Post('create')
  async createCategory(
    @Body(new ZodValidationPipe(categoryCreateSchema))
    categoryDto: TCategoryCreateSchema,
  ) {
    const res = await this.categoryService.createCategory(categoryDto);

    return ResponseBuilder.success(res, 'Category created successfully');
  }

  @Auth('category.read')
  @Get('list')
  async getCategories(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
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
  @Get(':id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    const res = await this.categoryService.getCategory(id);

    return ResponseBuilder.success(res, 'Category fetched successfully');
  }

  @Auth('category.update')
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(categoryCreateSchema))
    categoryDto: TCategoryCreateSchema,
  ) {
    const res = await this.categoryService.updateCategory(id, categoryDto);

    return ResponseBuilder.success(res, 'Category updated successfully');
  }

  @Auth('category.delete')
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);

    return ResponseBuilder.success(null, 'Category deleted successfully');
  }
}
