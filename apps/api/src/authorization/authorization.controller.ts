import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/authentication/auth.guard';
import type { TJWTPayload } from 'src/authentication/auth.service';
import { ResponseBuilder } from 'src/lib/response';
import { CurrentUser } from 'src/user/user.decorator';
import { AuthorizationService } from './authorization.service';

@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get('/access-list')
  @Auth()
  async getRoleAccessList(@CurrentUser() user: TJWTPayload) {
    const modules = await this.authorizationService.getRoleAccessList(user);

    return ResponseBuilder.success(
      modules,
      'Role access list fetched successfully',
    );
  }
}
