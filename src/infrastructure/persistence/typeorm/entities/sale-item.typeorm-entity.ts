import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleItem } from '../../../../domain/sales/entities/sale-item.entity';
import { SaleEntity } from './sale.typeorm-entity';
import { ProductEntity } from './product.typeorm-entity';

/**
 * SaleItem TypeORM Entity
 */
@Entity('sale_items')
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  saleId: string;

  @ManyToOne(() => SaleEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  lineTotal: number;

  toDomain(): SaleItem {
    return SaleItem.create(
      this.id,
      this.saleId,
      this.productId,
      this.quantity,
      this.unitPrice,
      this.discountAmount,
    );
  }

  static fromDomain(item: SaleItem): SaleItemEntity {
    const entity = new SaleItemEntity();
    entity.id = item.id;
    entity.saleId = item.saleId;
    entity.productId = item.productId;
    entity.quantity = item.quantity;
    entity.unitPrice = item.unitPrice;
    entity.discountAmount = item.discountAmount;
    entity.lineTotal = item.lineTotal;
    return entity;
  }
}

