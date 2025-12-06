import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

/**
 * Product Repository Interface (Port)
 */
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string, tenantId: string): Promise<Product | null>;
  findByBarcode(barcode: string, tenantId: string): Promise<Product | null>;
  findByTenantId(tenantId: string): Promise<Product[]>;
  findByCategoryId(categoryId: string): Promise<Product[]>;
  findByTenantIdAndSearch(tenantId: string, searchTerm: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

/**
 * Category Repository Interface (Port)
 */
export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string, tenantId: string): Promise<Category | null>;
  findByTenantId(tenantId: string): Promise<Category[]>;
  findAll(): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}

