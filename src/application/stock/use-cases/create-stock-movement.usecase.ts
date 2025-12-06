import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';
import { StockMovementResponseDto } from '../dto/stock-movement-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import { StockMovement } from '../../../domain/sales/entities/stock-movement.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Create Stock Movement Use Case
 */
@Injectable()
export class CreateStockMovementUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    dto: CreateStockMovementDto,
    currentUser: RequestUser,
  ): Promise<StockMovementResponseDto> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to create stock movements');
    }

    // Validate product exists and belongs to tenant
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundException(`Product with ID "${dto.productId}" not found`);
    }
    if (product.tenantId !== tenantId) {
      throw new ForbiddenException('Product does not belong to your tenant');
    }

    // Create stock movement
    const movementId = uuidv4();
    const movement = new StockMovement(
      movementId,
      dto.productId,
      tenantId,
      dto.movementType,
      dto.quantity,
      dto.unitPrice,
      currentUser.userId,
      new Date(),
      dto.referenceId,
      dto.notes,
    );

    // Update product stock
    const effectiveQuantity = movement.getEffectiveQuantity();
    if (effectiveQuantity > 0) {
      product.increaseStock(Math.abs(effectiveQuantity));
    } else {
      product.decreaseStock(Math.abs(effectiveQuantity));
    }

    // Save stock movement and update product
    await this.stockMovementRepository.save(movement);
    await this.productRepository.update(product);

    return {
      id: movement.id,
      productId: movement.productId,
      tenantId: movement.tenantId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      unitPrice: movement.unitPrice,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdBy: movement.createdBy,
      createdAt: movement.createdAt,
    };
  }
}

