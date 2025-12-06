/**
 * Sales Types
 */

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MIXED = 'MIXED',
}

export interface SaleItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  tenantId: string;
  saleNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  cashierName?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreateSaleRequest {
  items: CreateSaleItemRequest[];
  paymentMethod: PaymentMethod;
  discountAmount?: number;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
}

export interface PaginatedSalesResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
}

