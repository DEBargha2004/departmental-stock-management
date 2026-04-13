import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserManagementSevice } from './user-management.service';
import { Auth } from 'src/authentication/auth.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import {
  type TUserCreateSchema,
  type TUserUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
} from '@repo/contracts/user';
import { ResponseBuilder } from 'src/lib/response';

@Controller('user-management')
export class UserManagementController {
  constructor(private userManagementService: UserManagementSevice) {}

  @Auth('user.create', 'auth.create')
  @Post('create')
  async createUser(
    @Body(new ZodValidationPipe(userCreateSchema)) payload: TUserCreateSchema,
  ) {
    const res = await this.userManagementService.createUser(payload);

    return ResponseBuilder.success(res, 'User created successfully');
  }

  @Auth('user.update')
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userUpdateSchema)) payload: TUserUpdateSchema,
  ) {
    const res = await this.userManagementService.updateUser(id, payload);

    return ResponseBuilder.success(res, 'User updated succecssfully');
  }

  @Auth('user.delete', 'auth.delete')
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userManagementService.deleteUser(id);

    return ResponseBuilder.success(null, 'User deleted successfully');
  }
}
