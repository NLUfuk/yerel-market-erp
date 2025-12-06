/**
 * Reports Types
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

export interface TopProductResponse {
  productId: string;
  productName: string;
  salesQuantity: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface TopProductsResponse {
  products: TopProductResponse[];
  totalRevenue: number;
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  limit?: number;
}

