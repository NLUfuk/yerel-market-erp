import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { CreateStockMovementUseCase } from '../../application/stock/use-cases/create-stock-movement.usecase';
import { AdjustStockUseCase } from '../../application/stock/use-cases/adjust-stock.usecase';
import { ListStockMovementsUseCase } from '../../application/stock/use-cases/list-stock-movements.usecase';
import { ProductRepository } from '../../infrastructure/persistence/typeorm/repositories/product.typeorm-repo';
import { StockMovementRepository } from '../../infrastructure/persistence/typeorm/repositories/sale.typeorm-repo';
import { ProductEntity } from '../../infrastructure/persistence/typeorm/entities/product.typeorm-entity';
import { StockMovementEntity } from '../../infrastructure/persistence/typeorm/entities/stock-movement.typeorm-entity';

/**
 * Stock Module
 * Handles stock movement management
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, StockMovementEntity])],
  controllers: [StockController],
  providers: [
    CreateStockMovementUseCase,
    AdjustStockUseCase,
    ListStockMovementsUseCase,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'IStockMovementRepository',
      useClass: StockMovementRepository,
    },
  ],
  exports: ['IStockMovementRepository'],
})
export class StockModule {}

