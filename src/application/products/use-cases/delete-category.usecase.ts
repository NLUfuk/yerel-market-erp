import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Delete Category Use Case
 */
@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, currentUser: RequestUser): Promise<void> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to delete categories');
    }

    // Find category
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (category.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to delete this category');
    }

    // Check if category has products
    const products = await this.productRepository.findByCategoryId(id);
    if (products.length > 0) {
      throw new BadRequestException(
        `Cannot delete category. ${products.length} product(s) are using this category. Please reassign or delete products first.`,
      );
    }

    // Delete category
    await this.categoryRepository.delete(id);
  }
}

