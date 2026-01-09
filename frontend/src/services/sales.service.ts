import apiClient from '../utils/api';
import {
  Sale,
  CreateSaleRequest,
  UpdateSaleRequest,
  ListSalesParams,
  PaginatedSalesResponse,
} from '../types/sales';

/**
 * Sales Service
 * Handles sales API calls
 */
class SalesService {
  /**
   * Get sales list with pagination and filters
   */
  async getSales(params?: ListSalesParams): Promise<PaginatedSalesResponse> {
    const response = await apiClient.get<PaginatedSalesResponse>('/sales', {
      params,
    });
    return response.data;
  }

  /**
   * Get sale by ID
   */
  async getSale(id: string): Promise<Sale> {
    const response = await apiClient.get<Sale>(`/sales/${id}`);
    return response.data;
  }

  /**
   * Create a new sale
   */
  async createSale(data: CreateSaleRequest): Promise<Sale> {
    const response = await apiClient.post<Sale>('/sales', data);
    return response.data;
  }

  /**
   * Update an existing sale
   */
  async updateSale(id: string, data: UpdateSaleRequest): Promise<Sale> {
    const response = await apiClient.put<Sale>(`/sales/${id}`, data);
    return response.data;
  }

  /**
   * Delete a sale
   */
  async deleteSale(id: string): Promise<void> {
    await apiClient.delete(`/sales/${id}`);
  }
}

export const salesService = new SalesService();
export default salesService;

