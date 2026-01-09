import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Delete Sale Use Case
 * Deletes a sale and reverses stock movements
 */
@Injectable()
export class DeleteSaleUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(id: string, currentUser: RequestUser): Promise<void> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to delete sales');
    }

    // Find existing sale
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (sale.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to delete this sale');
    }

    // Step 1: Reverse stock movements (add stock back)
    for (const item of sale.items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        product.increaseStock(item.quantity);
        await this.productRepository.update(product);
      }
    }

    // Step 2: Delete stock movements
    const movements = await this.stockMovementRepository.findByReferenceId(id);
    for (const movement of movements) {
      await this.stockMovementRepository.delete(movement.id);
    }

    // Step 3: Delete sale
    await this.saleRepository.delete(id);
  }
}

