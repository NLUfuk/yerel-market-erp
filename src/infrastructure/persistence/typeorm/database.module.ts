import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { TenantEntity } from './entities/tenant.typeorm-entity';
import { RoleEntity } from './entities/role.typeorm-entity';
import { UserEntity } from './entities/user.typeorm-entity';
import { UserRoleEntity } from './entities/user-role.typeorm-entity';
import { CategoryEntity } from './entities/category.typeorm-entity';
import { ProductEntity } from './entities/product.typeorm-entity';
import { SaleEntity } from './entities/sale.typeorm-entity';
import { SaleItemEntity } from './entities/sale-item.typeorm-entity';
import { StockMovementEntity } from './entities/stock-movement.typeorm-entity';

/**
 * Database Module
 * Configures TypeORM with SQL Server
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
      entities: [
        TenantEntity,
        RoleEntity,
        UserEntity,
        UserRoleEntity,
        CategoryEntity,
        ProductEntity,
        SaleEntity,
        SaleItemEntity,
        StockMovementEntity,
      ],
    }),
  ],
})
export class DatabaseModule {}

