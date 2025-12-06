import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { CreateTenantUseCase } from '../../application/tenants/use-cases/create-tenant.usecase';
import { UpdateTenantUseCase } from '../../application/tenants/use-cases/update-tenant.usecase';
import { ListTenantsUseCase } from '../../application/tenants/use-cases/list-tenants.usecase';
import { GetTenantUseCase } from '../../application/tenants/use-cases/get-tenant.usecase';
import { TenantRepository } from '../../infrastructure/persistence/typeorm/repositories/tenant.typeorm-repo';
import { TenantEntity } from '../../infrastructure/persistence/typeorm/entities/tenant.typeorm-entity';

/**
 * Tenants Module
 * Handles tenant management
 */
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantsController],
  providers: [
    CreateTenantUseCase,
    UpdateTenantUseCase,
    ListTenantsUseCase,
    GetTenantUseCase,
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
  ],
  exports: ['ITenantRepository'],
})
export class TenantsModule {}

