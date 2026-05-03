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
import { PurchaseOrderService } from './purchase-order.service';
import { Auth } from 'src/authentication/auth.guard';
import {
  purchaseOrderCreateSchema,
  purchaseOrderUpdateSchema,
  type TPurchaseOrderUpdateSchema,
  type TPurchaseOrderCreateSchema,
} from '@repo/contracts/purchase-order';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { ResponseBuilder } from 'src/lib/response';
import { PURCHASE_ORDER_STATUS } from '@repo/contracts/status';
import { InventoryService } from './inventory.service';
import { CurrentUser } from 'src/user/user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';

@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Auth('purchase-order.create')
  @Post('create')
  async createPurchaseOrder(
    @Body(new ZodValidationPipe(purchaseOrderCreateSchema))
    payload: TPurchaseOrderCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.inventoryService.createPurchaseOrder(payload, user);

    return ResponseBuilder.success(res, 'Purchase Order created successfully');
  }

  @Auth('purchase-order.read')
  @Get('list')
  async getAllPurchaseOrders(
    @Query('query') query?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('status') status?: PURCHASE_ORDER_STATUS,
    @Query('vendorId', new ParseIntPipe({ optional: true })) vendorId?: number,
  ) {
    const res = await this.purchaseOrderService.getPurchaseOrders({
      query,
      limit,
      page,
      status,
      vendorId,
    });

    return ResponseBuilder.success(res, 'Purchase Orders fetched successfully');
  }

  @Auth('purchase-order.read')
  @Get(':id')
  async getPurchaseOrder(@Param('id', ParseIntPipe) id: number) {
    const res = await this.purchaseOrderService.getPurchaseOrder(id);

    return ResponseBuilder.success(res, 'Purchase Order fetched successfully');
  }

  @Auth('purchase-order.update')
  @Patch(':id')
  async updatePurchaseOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(purchaseOrderUpdateSchema))
    payload: TPurchaseOrderUpdateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.inventoryService.updatePurchaseOrder(
      id,
      payload,
      user,
    );

    return ResponseBuilder.success(res, 'Purchase Order updated successfully');
  }

  @Auth('purchase-order.delete')
  @Delete(':id')
  async deletePurchaseOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.inventoryService.deletePurchaseOrder(id, user);

    return ResponseBuilder.success(res, 'Purchase Order deleted successfully');
  }
}
