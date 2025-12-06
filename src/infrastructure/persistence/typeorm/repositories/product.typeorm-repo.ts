import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  IProductRepository,
  ICategoryRepository,
} from '../../../../domain/products/repositories/product.repository';
import { Product } from '../../../../domain/products/entities/product.entity';
import { Category } from '../../../../domain/products/entities/category.entity';
import { ProductEntity } from '../entities/product.typeorm-entity';
import { CategoryEntity } from '../entities/category.typeorm-entity';

/**
 * Product Repository Implementation (TypeORM)
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findBySku(sku: string, tenantId: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { sku, tenantId },
    });
    return entity ? entity.toDomain() : null;
  }

  async findByBarcode(barcode: string, tenantId: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { barcode, tenantId },
    });
    return entity ? entity.toDomain() : null;
  }

  async findByTenantId(tenantId: string): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByCategoryId(categoryId: string): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { categoryId },
      order: { name: 'ASC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByTenantIdAndSearch(
    tenantId: string,
    searchTerm: string,
  ): Promise<Product[]> {
    const entities = await this.repository.find({
      where: [
        { tenantId, name: Like(`%${searchTerm}%`) },
        { tenantId, sku: Like(`%${searchTerm}%`) },
        { tenantId, barcode: Like(`%${searchTerm}%`) },
      ],
      order: { name: 'ASC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async save(product: Product): Promise<Product> {
    const entity = ProductEntity.fromDomain(product);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async update(product: Product): Promise<Product> {
    return this.save(product);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

/**
 * Category Repository Implementation (TypeORM)
 */
@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByName(name: string, tenantId: string): Promise<Category | null> {
    const entity = await this.repository.findOne({
      where: { name, tenantId },
    });
    return entity ? entity.toDomain() : null;
  }

  async findByTenantId(tenantId: string): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findAll(): Promise<Category[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map((entity) => entity.toDomain());
  }

  async save(category: Category): Promise<Category> {
    const entity = CategoryEntity.fromDomain(category);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async update(category: Category): Promise<Category> {
    return this.save(category);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

