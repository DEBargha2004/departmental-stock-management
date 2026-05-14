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

import { CirculationService } from './circulation.service';
import { Auth } from 'src/authentication/auth.guard';
import { ResponseBuilder } from 'src/lib/response';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import {
  issueRequestCreateSchema,
  issueRequestUpdateSchema,
  returnRequestCreateSchema,
  returnRequestUpdateSchema,
  type TIssueRequestCreateSchema,
  type TIssueRequestUpdateSchema,
  type TReturnRequestCreateSchema,
  type TReturnRequestUpdateSchema,
} from '@repo/contracts/circulation';

import { CurrentUser } from 'src/user/user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';
import { InventoryService } from './inventory.service';

@Controller('circulation')
export class CirculationController {
  constructor(
    private readonly circulationService: CirculationService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Auth('issue-request.read')
  @Get('issue-request')
  async getIssueRequests(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('query') query?: string,
  ) {
    const res = await this.circulationService.getIssueRequests({
      limit,
      page,
      query,
    });

    return ResponseBuilder.success(res, 'Issue requests fetched successfully');
  }

  @Auth('issue-request.read')
  @Get('issue-request/:id')
  async getIssueRequest(@Param('id', ParseIntPipe) id: number) {
    const res = await this.inventoryService.getIssueRequest(id);

    return ResponseBuilder.success(res, 'Issue request fetched successfully');
  }

  @Auth('return-request.read')
  @Get('return-request')
  async getReturnRequests(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('query') query?: string,
  ) {
    const res = await this.circulationService.getReturnRequests({
      limit,
      page,
      query,
    });

    return ResponseBuilder.success(res, 'Return requests fetched successfully');
  }

  @Auth('return-request.read')
  @Get('return-request/:id')
  async getReturnRequest(@Param('id', ParseIntPipe) id: number) {
    const res = await this.inventoryService.getReturnRequest(id);

    return ResponseBuilder.success(res, 'Return request fetched successfully');
  }

  @Auth('issue-request.create')
  @Post('issue-request')
  async createIssueRequest(
    @Body(new ZodValidationPipe(issueRequestCreateSchema))
    data: TIssueRequestCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.createIssueRequest(data, user);

    return ResponseBuilder.success(null, 'Issue request created successfully');
  }

  @Auth('issue-request.update')
  @Patch('issue-request/:id')
  async updateIssueRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(issueRequestUpdateSchema))
    data: TIssueRequestUpdateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.updateIssueRequest(id, data, user);

    return ResponseBuilder.success(null, 'Issue request updated successfully');
  }

  @Auth('issue-request.delete')
  @Delete('issue-request/:id')
  async deleteIssueRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.deleteIssueRequest(id, user);

    return ResponseBuilder.success(null, 'Issue request deleted successfully');
  }

  @Auth('return-request.create')
  @Post('return-request')
  async createReturnRequest(
    @Body(new ZodValidationPipe(returnRequestCreateSchema))
    data: TReturnRequestCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.createReturnRequest(data, user);

    return ResponseBuilder.success(null, 'Return request created successfully');
  }

  @Auth('return-request.update')
  @Patch('return-request/:id')
  async updateReturnRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(returnRequestUpdateSchema))
    data: TReturnRequestUpdateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.updateReturnRequest(id, data, user);

    return ResponseBuilder.success(null, 'Return request updated successfully');
  }

  @Auth('return-request.delete')
  @Delete('return-request/:id')
  async deleteReturnRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.inventoryService.deleteReturnRequest(id, user);

    return ResponseBuilder.success(null, 'Return request deleted successfully');
  }
}
