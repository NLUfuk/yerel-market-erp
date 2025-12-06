/**
 * Products Types
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  tenantId: string;
  unitPrice: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  unitPrice: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  unitPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

