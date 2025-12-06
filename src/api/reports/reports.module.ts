import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { GetSalesSummaryUseCase } from '../../application/reports/use-cases/get-sales-summary.usecase';
import { GetTopProductsUseCase } from '../../application/reports/use-cases/get-top-products.usecase';
import { SaleRepository } from '../../infrastructure/persistence/typeorm/repositories/sale.typeorm-repo';
import { ProductRepository } from '../../infrastructure/persistence/typeorm/repositories/product.typeorm-repo';
import { SaleEntity } from '../../infrastructure/persistence/typeorm/entities/sale.typeorm-entity';
import { SaleItemEntity } from '../../infrastructure/persistence/typeorm/entities/sale-item.typeorm-entity';
import { ProductEntity } from '../../infrastructure/persistence/typeorm/entities/product.typeorm-entity';

/**
 * Reports Module
 * Handles reporting endpoints
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity, SaleItemEntity, ProductEntity]),
  ],
  controllers: [ReportsController],
  providers: [
    GetSalesSummaryUseCase,
    GetTopProductsUseCase,
    {
      provide: 'ISaleRepository',
      useClass: SaleRepository,
    },
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
})
export class ReportsModule {}

