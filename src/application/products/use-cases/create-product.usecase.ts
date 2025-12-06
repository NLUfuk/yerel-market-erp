import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import { Product } from '../../../domain/products/entities/product.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Create Product Use Case
 */
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    dto: CreateProductDto,
    currentUser: RequestUser,
  ): Promise<ProductResponseDto> {
    // Determine tenantId
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to create products');
    }

    // Validate category exists and belongs to tenant
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
    }
    if (category.tenantId !== tenantId) {
      throw new ForbiddenException('Category does not belong to your tenant');
    }

    // Check if SKU already exists for this tenant
    const existingBySku = await this.productRepository.findBySku(dto.sku, tenantId);
    if (existingBySku) {
      throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
    }

    // Check if barcode already exists (if provided)
    if (dto.barcode) {
      const existingByBarcode = await this.productRepository.findByBarcode(
        dto.barcode,
        tenantId,
      );
      if (existingByBarcode) {
        throw new ConflictException(
          `Product with barcode "${dto.barcode}" already exists`,
        );
      }
    }

    // Create product
    const productId = uuidv4();
    const product = new Product(
      productId,
      dto.name,
      dto.sku,
      dto.categoryId,
      tenantId,
      dto.unitPrice,
      new Date(),
      new Date(),
      dto.barcode,
      dto.costPrice,
      dto.stockQuantity,
      dto.minStockLevel,
      dto.isActive !== undefined ? dto.isActive : true,
    );

    const savedProduct = await this.productRepository.save(product);

    return {
      id: savedProduct.id,
      name: savedProduct.name,
      sku: savedProduct.sku,
      barcode: savedProduct.barcode,
      categoryId: savedProduct.categoryId,
      tenantId: savedProduct.tenantId,
      unitPrice: savedProduct.unitPrice,
      costPrice: savedProduct.costPrice,
      stockQuantity: savedProduct.stockQuantity,
      minStockLevel: savedProduct.minStockLevel,
      isActive: savedProduct.isActive,
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt,
    };
  }
}

