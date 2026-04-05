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
  UseGuards,
} from '@nestjs/common';
import { Auth, AuthGuard } from 'src/authentication/auth.guard';
import {
  PermissionGuard,
  Permissions,
} from 'src/authorization/permission.guard';
import { ZodValidationPipe } from 'src/global/pipes/zod-validation.pipe';
import { query, type TQuery } from '@repo/contracts/query';
import { userCreateSchema, type TUserCreateSchema } from '@repo/contracts/user';
import {} from '@repo/contracts/roles';
import { UserService } from './user.service';
import { ResponseBuilder } from 'src/lib/response';
import { AuthService } from 'src/authentication/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  async getCurrentUser() {
    return 'Hello';
  }

  @Auth('user.create')
  @Post('create')
  async createUser(
    @Body(new ZodValidationPipe(userCreateSchema)) payload: TUserCreateSchema,
  ) {}

  @Auth('user.read')
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {}

  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('user.read')
  @Get('list')
  async getUsers(@Query(new ZodValidationPipe(query)) query: TQuery) {}

  @Auth('user.update')
  @Patch(':id')
  async updateUser(
    @Query('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(userCreateSchema)) payload: TUserCreateSchema,
  ) {
    const user = await this.userService.updateUser(id, payload);
    await this.authService.updateCredentials(id, payload.password);

    return ResponseBuilder.success(user, 'User Updated Successfully');
  }

  @Auth('user.delete')
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.deleteUser(id);
    return ResponseBuilder.success(user, 'User Deleted Successfully');
  }
}
