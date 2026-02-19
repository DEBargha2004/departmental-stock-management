import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [UserController],
})
export class UserModule {}
