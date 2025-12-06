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
import { Category } from '../../../../domain/products/entities/category.entity';
import { TenantEntity } from './tenant.typeorm-entity';

/**
 * Category TypeORM Entity
 */
@Entity('categories')
@Index(['name', 'tenantId'], { unique: true })
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDomain(): Category {
    return new Category(
      this.id,
      this.name,
      this.tenantId,
      this.createdAt,
      this.updatedAt,
      this.description,
    );
  }

  static fromDomain(category: Category): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.description = category.description;
    entity.tenantId = category.tenantId;
    entity.createdAt = category.createdAt;
    entity.updatedAt = category.updatedAt;
    return entity;
  }
}

