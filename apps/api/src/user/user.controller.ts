import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/authentication/auth.guard';

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard)
  @Get('')
  async getCurrentUser() {
    return 'Hello';
  }
}
