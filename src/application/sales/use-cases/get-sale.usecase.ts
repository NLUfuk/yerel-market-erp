import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { SaleResponseDto } from '../dto/sale-response.dto';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Get Sale Use Case
 */
@Injectable()
export class GetSaleUseCase {
  constructor(
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, currentUser: RequestUser): Promise<SaleResponseDto> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to get sale details');
    }

    // Find sale
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (sale.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to view this sale');
    }

    // Get product names for items
    const productIds = new Set<string>();
    sale.items.forEach((item) => productIds.add(item.productId));

    const productNames: Record<string, string> = {};
    for (const productId of Array.from(productIds)) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        productNames[productId] = product.name;
      }
    }

    return {
      id: sale.id,
      tenantId: sale.tenantId,
      saleNumber: sale.saleNumber,
      totalAmount: sale.totalAmount,
      discountAmount: sale.discountAmount,
      finalAmount: sale.finalAmount,
      paymentMethod: sale.paymentMethod,
      cashierId: sale.cashierId,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: productNames[item.productId],
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        lineTotal: item.lineTotal,
      })),
      createdAt: sale.createdAt,
    };
  }
}

