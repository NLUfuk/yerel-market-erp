import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from '../../../../domain/users/entities/user.entity';
import { RoleEntity } from './role.typeorm-entity';
import { TenantEntity } from './tenant.typeorm-entity';

/**
 * User TypeORM Entity
 */
@Entity('users')
@Index(['email', 'tenantId'], { unique: true, where: 'tenantId IS NOT NULL' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  email: string;

  @Column({ type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'nvarchar', length: 100 })
  firstName: string;

  @Column({ type: 'nvarchar', length: 100 })
  lastName: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant?: TenantEntity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  toDomain(): User {
    const user = new User(
      this.id,
      this.email,
      this.passwordHash,
      this.firstName,
      this.lastName,
      this.tenantId || null,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.roles?.map((r) => r.toDomain()) || [],
    );
    return user;
  }

  static fromDomain(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.tenantId = user.tenantId || undefined;
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}

