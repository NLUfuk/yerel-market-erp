import apiClient from '../utils/api';
import {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types/products';

/**
 * Products Service
 * Handles product and category API calls
 */
class ProductsService {
  /**
   * Get products list with pagination
   */
  async getProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params,
    });
    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  /**
   * Get categories list
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/products/categories');
    return response.data;
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<Category>('/products/categories', data);
    return response.data;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.put<Category>(`/products/categories/${id}`, data);
    return response.data;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/products/categories/${id}`);
  }
}

export const productsService = new ProductsService();
export default productsService;

