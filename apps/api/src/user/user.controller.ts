import {
  Controller,
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

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard)
  @Get('')
  async getCurrentUser() {
    return 'Hello';
  }

  @Auth('user.create')
  @Post('create')
  async createUser() {}

  @Auth('user.read')
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {}

  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions('user.read')
  @Get('list')
  async getUsers(@Query(new ZodValidationPipe(query)) query: TQuery) {}

  @Auth('user.update')
  @Patch(':id')
  async updateUser(@Query('id', ParseIntPipe) id: number) {}
}
