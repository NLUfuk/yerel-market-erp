import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sale, PaymentMethod } from '../../../../domain/sales/entities/sale.entity';
import { SaleItemEntity } from './sale-item.typeorm-entity';
import { UserEntity } from './user.typeorm-entity';
import { TenantEntity } from './tenant.typeorm-entity';

/**
 * Sale TypeORM Entity
 */
@Entity('sales')
@Index(['saleNumber', 'tenantId'], { unique: true })
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Column({ type: 'nvarchar', length: 50 })
  saleNumber: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  finalAmount: number;

  @Column({ type: 'nvarchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({ type: 'uuid' })
  cashierId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'cashierId' })
  cashier: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SaleItemEntity, (item) => item.sale, { cascade: true })
  items: SaleItemEntity[];

  toDomain(): Sale {
    const sale = Sale.create(
      this.id,
      this.tenantId,
      this.saleNumber,
      this.items?.map((i) => i.toDomain()) || [],
      this.paymentMethod,
      this.cashierId,
      this.discountAmount,
    );
    return sale;
  }

  static fromDomain(sale: Sale): SaleEntity {
    const entity = new SaleEntity();
    entity.id = sale.id;
    entity.tenantId = sale.tenantId;
    entity.saleNumber = sale.saleNumber;
    entity.totalAmount = sale.totalAmount;
    entity.discountAmount = sale.discountAmount;
    entity.finalAmount = sale.finalAmount;
    entity.paymentMethod = sale.paymentMethod;
    entity.cashierId = sale.cashierId;
    entity.createdAt = sale.createdAt;
    entity.items = sale.items.map((item) => SaleItemEntity.fromDomain(item));
    return entity;
  }
}

