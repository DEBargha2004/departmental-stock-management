import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import {
  type TUserCreateSchema,
  type TUserUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
} from '@repo/contracts/user';
import { ResponseBuilder } from 'src/lib/response';
import { CurrentUser } from 'src/user/user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';

@Controller('user-management')
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  @Auth('user.create', 'auth.create')
  @Post('create')
  async createUser(
    @Body(new ZodValidationPipe(userCreateSchema)) payload: TUserCreateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.userManagementService.createUser(payload, user);

    return ResponseBuilder.success(res, 'User created successfully');
  }

  @Auth('user.update')
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userUpdateSchema)) payload: TUserUpdateSchema,
    @CurrentUser() user: TJWTPayload,
  ) {
    const res = await this.userManagementService.updateUser(id, payload, user);

    return ResponseBuilder.success(res, 'User updated succecssfully');
  }

  @Auth('user.delete', 'auth.delete')
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TJWTPayload,
  ) {
    await this.userManagementService.deleteUser(id, user);

    return ResponseBuilder.success(null, 'User deleted successfully');
  }
}
