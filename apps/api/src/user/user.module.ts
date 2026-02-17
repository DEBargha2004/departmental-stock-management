import { Module } from '@nestjs/common';
import { DATABASE_MODULE } from 'src/database/db.module';
import { UserController } from './user.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [UserController],
})
export class UserModule {}
