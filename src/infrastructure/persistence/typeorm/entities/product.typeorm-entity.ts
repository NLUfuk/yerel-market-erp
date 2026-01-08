import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../../../domain/products/entities/product.entity';
import { CategoryEntity } from './category.typeorm-entity';
import { TenantEntity } from './tenant.typeorm-entity';

/**
 * Product TypeORM Entity
 */
@Entity('products')
@Index(['sku', 'tenantId'], { unique: true })
@Index(['barcode', 'tenantId'], { unique: true, where: 'barcode IS NOT NULL' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 100 })
  sku: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  barcode?: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  costPrice?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  stockQuantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  minStockLevel: number;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): Product {
    return new Product(
      this.id,
      this.name,
      this.sku,
      this.categoryId,
      this.tenantId,
      this.unitPrice,
      this.createdAt,
      this.updatedAt,
      this.barcode,
      this.costPrice,
      this.stockQuantity,
      this.minStockLevel,
      this.isActive,
    );
  }

  static fromDomain(product: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.name = product.name;
    entity.sku = product.sku;
    entity.barcode = product.barcode;
    entity.categoryId = product.categoryId;
    entity.tenantId = product.tenantId;
    entity.unitPrice = product.unitPrice;
    entity.costPrice = product.costPrice;
    entity.stockQuantity = product.stockQuantity;
    entity.minStockLevel = product.minStockLevel;
    entity.isActive = product.isActive;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }
}

