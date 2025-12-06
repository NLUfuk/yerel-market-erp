import { Injectable, Inject } from '@nestjs/common';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Sales Summary Response
 */
export interface SalesSummaryResponse {
  totalSales: number;
  totalOrders: number;
  averageDaily: number;
  growthPercentage: number;
  dailyBreakdown: Array<{
    date: string;
    sales: number;
    orders: number;
    averageOrder: number;
  }>;
}

/**
 * Get Sales Summary Use Case
 */
@Injectable()
export class GetSalesSummaryUseCase {
  constructor(
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
  ) {}

  async execute(
    startDate: Date,
    endDate: Date,
    currentUser: RequestUser,
  ): Promise<SalesSummaryResponse> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required to get sales summary');
    }

    const sales = await this.saleRepository.findByTenantIdAndDateRange(
      tenantId,
      startDate,
      endDate,
    );

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const totalOrders = sales.length;
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const averageDaily = daysDiff > 0 ? totalSales / daysDiff : 0;

    // Group by date
    const salesByDate: Record<string, { sales: number; orders: number }> = {};
    sales.forEach((sale) => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sales: 0, orders: 0 };
      }
      salesByDate[dateKey].sales += sale.finalAmount;
      salesByDate[dateKey].orders += 1;
    });

    // Calculate previous period for growth
    const periodDiff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = startDate;
    const prevSales = await this.saleRepository.findByTenantIdAndDateRange(
      tenantId,
      prevStartDate,
      prevEndDate,
    );
    const prevTotalSales = prevSales.reduce(
      (sum, sale) => sum + sale.finalAmount,
      0,
    );
    const growthPercentage =
      prevTotalSales > 0
        ? ((totalSales - prevTotalSales) / prevTotalSales) * 100
        : 0;

    // Daily breakdown
    const dailyBreakdown = Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders,
        averageOrder: data.orders > 0 ? data.sales / data.orders : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales,
      totalOrders,
      averageDaily,
      growthPercentage: Math.round(growthPercentage * 100) / 100,
      dailyBreakdown,
    };
  }
}

