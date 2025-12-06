import { Injectable, Inject } from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * List Products Use Case
 */
@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    pagination: PaginationDto,
    currentUser: RequestUser,
  ): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required to list products');
    }

    let products;

    // Apply search if provided
    if (pagination.search) {
      products = await this.productRepository.findByTenantIdAndSearch(
        currentUser.tenantId,
        pagination.search,
      );
    } else {
      products = await this.productRepository.findByTenantId(currentUser.tenantId);
    }

    // Simple pagination (in production, this should be done at database level)
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      data: paginatedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        tenantId: product.tenantId,
        unitPrice: product.unitPrice,
        costPrice: product.costPrice,
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      total: products.length,
      page,
      limit,
    };
  }
}

