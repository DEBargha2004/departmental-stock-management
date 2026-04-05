import { Module } from '@nestjs/common';
import { UserManagementSevice } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/authentication/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  providers: [UserManagementSevice],
  controllers: [UserManagementController],
  exports: [UserManagementSevice],
})
export class UserManagementModule {}
