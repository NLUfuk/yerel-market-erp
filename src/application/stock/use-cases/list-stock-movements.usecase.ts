import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Stock Movement Response
 */
export interface StockMovementResponse {
  id: string;
  productId: string;
  productName?: string;
  movementType: string;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

/**
 * List Stock Movements Use Case
 */
@Injectable()
export class ListStockMovementsUseCase {
  constructor(
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    currentUser: RequestUser,
    productId?: string,
  ): Promise<StockMovementResponse[]> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to list stock movements');
    }

    let movements;
    if (productId) {
      movements = await this.stockMovementRepository.findByProductId(productId);
      // Filter by tenant
      movements = movements.filter((m) => m.tenantId === tenantId);
    } else {
      movements = await this.stockMovementRepository.findByTenantId(tenantId);
    }

    // Get product names
    const productIds = new Set<string>();
    movements.forEach((m) => productIds.add(m.productId));

    const productNames: Record<string, string> = {};
    for (const pid of Array.from(productIds)) {
      const product = await this.productRepository.findById(pid);
      if (product) {
        productNames[pid] = product.name;
      }
    }

    return movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: productNames[movement.productId],
      movementType: movement.movementType,
      quantity: movement.quantity,
      unitPrice: movement.unitPrice,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdBy: movement.createdBy,
      createdAt: movement.createdAt,
    }));
  }
}

