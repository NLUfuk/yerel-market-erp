import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { CreateProductUseCase } from '../../application/products/use-cases/create-product.usecase';
import { UpdateProductUseCase } from '../../application/products/use-cases/update-product.usecase';
import { ListProductsUseCase } from '../../application/products/use-cases/list-products.usecase';
import { CreateCategoryUseCase } from '../../application/products/use-cases/create-category.usecase';
import { UpdateCategoryUseCase } from '../../application/products/use-cases/update-category.usecase';
import { DeleteCategoryUseCase } from '../../application/products/use-cases/delete-category.usecase';
import { DeleteProductUseCase } from '../../application/products/use-cases/delete-product.usecase';
import { ListCategoriesUseCase } from '../../application/products/use-cases/list-categories.usecase';
import { ProductRepository } from '../../infrastructure/persistence/typeorm/repositories/product.typeorm-repo';
import { CategoryRepository } from '../../infrastructure/persistence/typeorm/repositories/product.typeorm-repo';
import { ProductEntity } from '../../infrastructure/persistence/typeorm/entities/product.typeorm-entity';
import { CategoryEntity } from '../../infrastructure/persistence/typeorm/entities/category.typeorm-entity';

/**
 * Products Module
 * Handles product and category management
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity])],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    DeleteProductUseCase,
    ListCategoriesUseCase,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: CategoryRepository,
    },
  ],
  exports: ['IProductRepository', 'ICategoryRepository'],
})
export class ProductsModule {}

