import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role, RoleName } from '../../../../domain/users/entities/role.entity';

/**
 * Role TypeORM Entity
 */
@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  name: RoleName;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  toDomain(): Role {
    return new Role(this.id, this.name, this.description, this.createdAt);
  }

  static fromDomain(role: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = role.id;
    entity.name = role.name;
    entity.description = role.description;
    entity.createdAt = role.createdAt;
    return entity;
  }
}

