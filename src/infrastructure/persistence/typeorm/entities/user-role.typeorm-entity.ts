import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../../domain/users/entities/user-role.entity';
import { UserEntity } from './user.typeorm-entity';
import { RoleEntity } from './role.typeorm-entity';

/**
 * UserRole TypeORM Entity (Join Table)
 */
@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'uuid' })
  roleId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ type: 'uuid' })
  assignedBy: string;

  toDomain(): UserRole {
    return new UserRole(
      this.userId,
      this.roleId,
      this.assignedAt,
      this.assignedBy,
    );
  }

  static fromDomain(userRole: UserRole): UserRoleEntity {
    const entity = new UserRoleEntity();
    entity.userId = userRole.userId;
    entity.roleId = userRole.roleId;
    entity.assignedAt = userRole.assignedAt;
    entity.assignedBy = userRole.assignedBy;
    return entity;
  }
}

