import { Injectable, Inject } from '@nestjs/common';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Top Product Response
 */
export interface TopProductResponse {
  productId: string;
  productName: string;
  salesQuantity: number;
  revenue: number;
  percentageOfTotal: number;
}

/**
 * Get Top Products Use Case
 */
@Injectable()
export class GetTopProductsUseCase {
  constructor(
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    startDate: Date,
    endDate: Date,
    currentUser: RequestUser,
    limit: number = 10,
  ): Promise<{
    products: TopProductResponse[];
    totalRevenue: number;
  }> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required to get top products');
    }

    const sales = await this.saleRepository.findByTenantIdAndDateRange(
      tenantId,
      startDate,
      endDate,
    );

    // Aggregate by product
    const productStats: Record<
      string,
      { quantity: number; revenue: number }
    > = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = { quantity: 0, revenue: 0 };
        }
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += item.lineTotal;
      });
    });

    // Calculate total revenue
    const totalRevenue = Object.values(productStats).reduce(
      (sum, stat) => sum + stat.revenue,
      0,
    );

    // Get product names
    const productIds = Object.keys(productStats);
    const productNames: Record<string, string> = {};
    for (const productId of productIds) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        productNames[productId] = product.name;
      }
    }

    // Sort by revenue and get top N
    const topProducts = Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        productName: productNames[productId] || 'Unknown',
        salesQuantity: stats.quantity,
        revenue: stats.revenue,
        percentageOfTotal:
          totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return {
      products: topProducts,
      totalRevenue,
    };
  }
}

