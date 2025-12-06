import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import { StockMovement, StockMovementType } from '../../../domain/sales/entities/stock-movement.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Adjust Stock Use Case
 * Manually adjust stock quantity (for corrections)
 */
@Injectable()
export class AdjustStockUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    productId: string,
    newQuantity: number,
    notes: string,
    currentUser: RequestUser,
  ): Promise<{
    productId: string;
    oldQuantity: number;
    newQuantity: number;
    adjustment: number;
  }> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to adjust stock');
    }

    // Validate product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }
    if (product.tenantId !== tenantId) {
      throw new ForbiddenException('Product does not belong to your tenant');
    }

    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const oldQuantity = product.stockQuantity;
    const adjustment = newQuantity - oldQuantity;

    // Update product stock
    product.updateStock(newQuantity);

    // Create stock movement record
    const movementId = uuidv4();
    const movement = new StockMovement(
      movementId,
      productId,
      tenantId,
      StockMovementType.ADJUSTMENT,
      adjustment,
      product.unitPrice, // Use current unit price
      currentUser.userId,
      new Date(),
      undefined,
      notes,
    );

    // Save
    await this.productRepository.update(product);
    await this.stockMovementRepository.save(movement);

    return {
      productId,
      oldQuantity,
      newQuantity,
      adjustment,
    };
  }
}

