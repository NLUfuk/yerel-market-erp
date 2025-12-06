import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Update Product Use Case
 */
@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductDto,
    currentUser: RequestUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Check tenant access
    if (product.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException(
        'You can only update products from your own tenant',
      );
    }

    // Validate category if being changed
    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
      }
      if (category.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('Category does not belong to your tenant');
      }
    }

    // Check SKU uniqueness if being changed
    if (dto.sku && dto.sku !== product.sku) {
      const existingBySku = await this.productRepository.findBySku(
        dto.sku,
        product.tenantId,
      );
      if (existingBySku) {
        throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
      }
      product.updateSku(dto.sku);
    }

    // Check barcode uniqueness if being changed
    if (dto.barcode !== undefined && dto.barcode !== product.barcode) {
      if (dto.barcode) {
        const existingByBarcode = await this.productRepository.findByBarcode(
          dto.barcode,
          product.tenantId,
        );
        if (existingByBarcode) {
          throw new ConflictException(
            `Product with barcode "${dto.barcode}" already exists`,
          );
        }
      }
      product.updateBarcode(dto.barcode);
    }

    // Update other fields
    if (dto.name) {
      product.updateName(dto.name);
    }

    if (dto.unitPrice !== undefined || dto.costPrice !== undefined) {
      product.updatePricing(
        dto.unitPrice ?? product.unitPrice,
        dto.costPrice,
      );
    }

    if (dto.stockQuantity !== undefined) {
      product.updateStock(dto.stockQuantity);
    }

    if (dto.minStockLevel !== undefined) {
      product.updateMinStockLevel(dto.minStockLevel);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        product.activate();
      } else {
        product.deactivate();
      }
    }

    const updatedProduct = await this.productRepository.update(product);

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      barcode: updatedProduct.barcode,
      categoryId: updatedProduct.categoryId,
      tenantId: updatedProduct.tenantId,
      unitPrice: updatedProduct.unitPrice,
      costPrice: updatedProduct.costPrice,
      stockQuantity: updatedProduct.stockQuantity,
      minStockLevel: updatedProduct.minStockLevel,
      isActive: updatedProduct.isActive,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  }
}

