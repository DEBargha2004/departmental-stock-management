import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './lib/config';
import { DatabaseModule } from './database/db.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './authentication/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 20 }],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
