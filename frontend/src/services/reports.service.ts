import apiClient from '../utils/api';
import {
  SalesSummaryResponse,
  TopProductsResponse,
  ReportParams,
} from '../types/reports';

/**
 * Reports Service
 * Handles reports API calls
 */
class ReportsService {
  /**
   * Get sales summary report
   */
  async getSalesSummary(params: ReportParams): Promise<SalesSummaryResponse> {
    const response = await apiClient.get<SalesSummaryResponse>(
      '/reports/sales-summary',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      },
    );
    return response.data;
  }

  /**
   * Get top products report
   */
  async getTopProducts(params: ReportParams): Promise<TopProductsResponse> {
    const response = await apiClient.get<TopProductsResponse>(
      '/reports/top-products',
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          limit: params.limit || 10,
        },
      },
    );
    return response.data;
  }
}

export const reportsService = new ReportsService();
export default reportsService;

