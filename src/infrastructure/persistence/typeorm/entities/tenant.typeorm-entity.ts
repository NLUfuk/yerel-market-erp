import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../../../domain/tenants/entities/tenant.entity';

/**
 * Tenant TypeORM Entity
 * Maps domain Tenant to database table
 */
@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  address?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Convert TypeORM entity to domain entity
   */
  toDomain(): Tenant {
    return new Tenant(
      this.id,
      this.name,
      this.address,
      this.phone,
      this.email,
      this.isActive,
      this.createdAt,
      this.updatedAt,
    );
  }

  /**
   * Create TypeORM entity from domain entity
   */
  static fromDomain(tenant: Tenant): TenantEntity {
    const entity = new TenantEntity();
    entity.id = tenant.id;
    entity.name = tenant.name;
    entity.address = tenant.address;
    entity.phone = tenant.phone;
    entity.email = tenant.email;
    entity.isActive = tenant.isActive;
    entity.createdAt = tenant.createdAt;
    entity.updatedAt = tenant.updatedAt;
    return entity;
  }
}

