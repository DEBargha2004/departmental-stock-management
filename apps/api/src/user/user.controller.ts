import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Auth } from 'src/authentication/auth.guard';
import { UserService } from './user.service';
import { ResponseBuilder } from 'src/lib/response';
import { CurrentUser } from './user.decorator';
import type { TJWTPayload } from 'src/authentication/auth.service';
import { buildUserObject } from './user.utils';
import type { Role } from '@repo/contracts/roles';

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
    @Query('role') role?: Role,
  ) {
    const users = await this.userService.getUsers({ query, role, limit });

    return ResponseBuilder.success(users.map(buildUserObject));
  }

  @Auth('user.read')
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);

    return ResponseBuilder.success(buildUserObject(user));
  }
}
