import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/authentication/auth.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [UserModule, AuthModule, AuditModule],
  providers: [UserManagementService],
  controllers: [UserManagementController],
  exports: [UserManagementService],
})
export class UserManagementModule {}
