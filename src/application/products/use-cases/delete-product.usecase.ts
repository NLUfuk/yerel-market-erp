import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Delete Product Use Case
 * Soft delete: Sets isActive = false
 * Note: Product will be deactivated instead of hard deleted to preserve sales history
 */
@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, currentUser: RequestUser): Promise<void> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to delete products');
    }

    // Find product
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (product.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    // Soft delete: Set isActive = false
    // This preserves sales history while preventing new sales
    product.deactivate();
    await this.productRepository.update(product);
  }
}
