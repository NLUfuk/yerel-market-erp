/**
 * Stock Types
 */

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  tenantId: string;
  movementType: StockMovementType;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateStockMovementRequest {
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  notes?: string;
}

export interface AdjustStockRequest {
  newQuantity: number;
  notes?: string;
}

export interface AdjustStockResponse {
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  adjustment: number;
}

export interface ListStockMovementsParams {
  productId?: string;
  movementType?: StockMovementType;
  startDate?: string;
  endDate?: string;
}
