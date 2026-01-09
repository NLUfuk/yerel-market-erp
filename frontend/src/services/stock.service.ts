import apiClient from '../utils/api';
import {
  StockMovement,
  CreateStockMovementRequest,
  AdjustStockRequest,
  AdjustStockResponse,
  ListStockMovementsParams,
} from '../types/stock';

/**
 * Stock Service
 * Handles stock movement API calls
 */
class StockService {
  /**
   * Get stock movements list with optional filters
   */
  async getStockMovements(params?: ListStockMovementsParams): Promise<StockMovement[]> {
    const response = await apiClient.get<StockMovement[]>('/stock/movements', {
      params,
    });
    return response.data;
  }

  /**
   * Create a new stock movement
   */
  async createStockMovement(data: CreateStockMovementRequest): Promise<StockMovement> {
    const response = await apiClient.post<StockMovement>('/stock/movements', data);
    return response.data;
  }

  /**
   * Adjust stock quantity for a product
   * Only accessible by TenantAdmin
   */
  async adjustStock(
    productId: string,
    newQuantity: number,
    notes?: string,
  ): Promise<AdjustStockResponse> {
    const response = await apiClient.put<AdjustStockResponse>(
      `/stock/products/${productId}/adjust`,
      {
        newQuantity,
        notes,
      },
    );
    return response.data;
  }
}

export const stockService = new StockService();
export default stockService;
