import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './lib/config';
import { DatabaseModule } from './database/db.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './authentication/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { SeederService } from './seeder.service';
import { UserManagementModule } from './user-management/user-management.module';
import { InventoryModule } from './inventory/inventory.module';
import { VendorModule } from './vendor/vendor.module';
import { StockProcurementModule } from './stock-procurement/stock-procurement.module';
import { RouterModule } from '@nestjs/core';
import { AuditController } from './audit/audit.controller';
import { AuditModule } from './audit/audit.module';

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
    AuthorizationModule,
    UserManagementModule,
    VendorModule,
    InventoryModule,
    StockProcurementModule,
    RouterModule.register([
      {
        path: 'inventory',
        module: InventoryModule,
      },
    ]),
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
