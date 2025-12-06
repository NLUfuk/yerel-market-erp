import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { CreateSaleUseCase } from '../../application/sales/use-cases/create-sale.usecase';
import { ListSalesUseCase } from '../../application/sales/use-cases/list-sales.usecase';
import { GetSaleUseCase } from '../../application/sales/use-cases/get-sale.usecase';
import { SaleRepository } from '../../infrastructure/persistence/typeorm/repositories/sale.typeorm-repo';
import { StockMovementRepository } from '../../infrastructure/persistence/typeorm/repositories/sale.typeorm-repo';
import { ProductRepository } from '../../infrastructure/persistence/typeorm/repositories/product.typeorm-repo';
import { SaleEntity } from '../../infrastructure/persistence/typeorm/entities/sale.typeorm-entity';
import { SaleItemEntity } from '../../infrastructure/persistence/typeorm/entities/sale-item.typeorm-entity';
import { StockMovementEntity } from '../../infrastructure/persistence/typeorm/entities/stock-movement.typeorm-entity';
import { ProductEntity } from '../../infrastructure/persistence/typeorm/entities/product.typeorm-entity';

/**
 * Sales Module
 * Handles sales operations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleEntity,
      SaleItemEntity,
      StockMovementEntity,
      ProductEntity,
    ]),
  ],
  controllers: [SalesController],
  providers: [
    CreateSaleUseCase,
    ListSalesUseCase,
    GetSaleUseCase,
    {
      provide: 'ISaleRepository',
      useClass: SaleRepository,
    },
    {
      provide: 'IStockMovementRepository',
      useClass: StockMovementRepository,
    },
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: ['ISaleRepository'],
})
export class SalesModule {}

