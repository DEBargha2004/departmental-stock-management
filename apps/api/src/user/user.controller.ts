import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/authentication/auth.guard';
import { UserService } from './user.service';
import { ResponseBuilder } from 'src/lib/response';
import { CurrentUser } from './user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';
import { buildUserObject } from './user.utils';
import type { Role } from '@repo/contracts/roles';
import type { STATUS } from '@repo/contracts/status';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Auth()
  @Get('')
  async getCurrentUser(@CurrentUser() jwt: TJWTPayload) {
    return ResponseBuilder.success(buildUserObject(jwt));
  }

  @Auth('user.read')
  @Get('list')
  async getUsers(
    @Query('query') query: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('status') status?: STATUS,
    @Query('role') role?: Role,
  ) {
    const res = await this.userService.getUsers({
      query,
      role,
      limit,
      page,
      status,
    });

    return ResponseBuilder.success({
      list: res.list,
      count: res.count,
    });
  }

  @Auth('user.read')
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);

    return ResponseBuilder.success(user);
  }
}
