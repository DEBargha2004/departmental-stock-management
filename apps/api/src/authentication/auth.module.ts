import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [UserModule, MailModule, AuthorizationModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
