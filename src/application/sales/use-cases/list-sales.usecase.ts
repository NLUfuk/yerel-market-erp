import { Injectable, Inject } from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { SaleResponseDto } from '../dto/sale-response.dto';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * List Sales Use Case
 */
@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    pagination: PaginationDto,
    currentUser: RequestUser,
    startDate?: Date,
    endDate?: Date,
    cashierId?: string,
  ): Promise<{
    data: SaleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required to list sales');
    }

    let sales;

    // Apply filters
    if (startDate && endDate) {
      sales = await this.saleRepository.findByTenantIdAndDateRange(
        tenantId,
        startDate,
        endDate,
      );
    } else if (cashierId) {
      sales = await this.saleRepository.findByCashierId(cashierId);
      // Filter by tenant
      sales = sales.filter((sale) => sale.tenantId === tenantId);
    } else {
      sales = await this.saleRepository.findByTenantId(tenantId);
    }

    // Simple pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedSales = sales.slice(startIndex, endIndex);

    // Get product names for items
    const productIds = new Set<string>();
    paginatedSales.forEach((sale) => {
      sale.items.forEach((item) => productIds.add(item.productId));
    });

    const productNames: Record<string, string> = {};
    for (const productId of Array.from(productIds)) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        productNames[productId] = product.name;
      }
    }

    return {
      data: paginatedSales.map((sale) => ({
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
      })),
      total: sales.length,
      page,
      limit,
    };
  }
}

