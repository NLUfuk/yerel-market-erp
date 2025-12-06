import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  StockMovement,
  StockMovementType,
} from '../../../../domain/sales/entities/stock-movement.entity';
import { ProductEntity } from './product.typeorm-entity';
import { TenantEntity } from './tenant.typeorm-entity';
import { UserEntity } from './user.typeorm-entity';

/**
 * StockMovement TypeORM Entity
 */
@Entity('stock_movements')
@Index(['productId', 'createdAt'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Column({ type: 'nvarchar', length: 20 })
  movementType: StockMovementType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'uuid', nullable: true })
  referenceId?: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createdBy' })
  creator: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  toDomain(): StockMovement {
    return new StockMovement(
      this.id,
      this.productId,
      this.tenantId,
      this.movementType,
      this.quantity,
      this.unitPrice,
      this.createdBy,
      this.createdAt,
      this.referenceId,
      this.notes,
    );
  }

  static fromDomain(movement: StockMovement): StockMovementEntity {
    const entity = new StockMovementEntity();
    entity.id = movement.id;
    entity.productId = movement.productId;
    entity.tenantId = movement.tenantId;
    entity.movementType = movement.movementType;
    entity.quantity = movement.quantity;
    entity.unitPrice = movement.unitPrice;
    entity.referenceId = movement.referenceId;
    entity.notes = movement.notes;
    entity.createdBy = movement.createdBy;
    entity.createdAt = movement.createdAt;
    return entity;
  }
}

