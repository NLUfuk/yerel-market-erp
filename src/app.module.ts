import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/typeorm/database.module';
import { AuthModule } from './api/auth/auth.module';
import { TenantsModule } from './api/tenants/tenants.module';
import { UsersModule } from './api/users/users.module';
import { ProductsModule } from './api/products/products.module';
import { StockModule } from './api/stock/stock.module';
import { SalesModule } from './api/sales/sales.module';
import { ReportsModule } from './api/reports/reports.module';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';

/**
 * App Module
 * Root module of the application
 * Configures global guards for authentication and authorization
 */
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ProductsModule,
    StockModule,
    SalesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Guards - All routes are protected by default
    // Use @Public() decorator to make routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
