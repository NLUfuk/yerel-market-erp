import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUserRepository,
  IRoleRepository,
  IUserRoleRepository,
} from '../../../../domain/users/repositories/user.repository';
import { User } from '../../../../domain/users/entities/user.entity';
import { Role } from '../../../../domain/users/entities/role.entity';
import { UserRole } from '../../../../domain/users/entities/user-role.entity';
import { UserEntity } from '../entities/user.typeorm-entity';
import { RoleEntity } from '../entities/role.typeorm-entity';
import { UserRoleEntity } from '../entities/user-role.typeorm-entity';

/**
 * User Repository Implementation (TypeORM)
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['roles'],
    });
    return entity ? entity.toDomain() : null;
  }

  async findByEmail(email: string, tenantId?: string | null): Promise<User | null> {
    const where: any = { email };
    if (tenantId !== undefined) {
      where.tenantId = tenantId;
    }
    const entity = await this.repository.findOne({
      where,
      relations: ['roles'],
    });
    return entity ? entity.toDomain() : null;
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      relations: ['roles'],
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find({ relations: ['roles'] });
    return entities.map((entity) => entity.toDomain());
  }

  async save(user: User): Promise<User> {
    const entity = UserEntity.fromDomain(user);
    const saved = await this.repository.save(entity);
    const found = await this.findById(saved.id);
    return found || saved.toDomain();
  }

  async update(user: User): Promise<User> {
    return this.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

/**
 * Role Repository Implementation (TypeORM)
 */
@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repository: Repository<RoleEntity>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.repository.findOneBy({ name: name as any });
    return entity ? entity.toDomain() : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => entity.toDomain());
  }

  async save(role: Role): Promise<Role> {
    const entity = RoleEntity.fromDomain(role);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }
}

/**
 * UserRole Repository Implementation (TypeORM)
 */
@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly repository: Repository<UserRoleEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserRole[]> {
    const entities = await this.repository.find({ where: { userId } });
    return entities.map((entity) => entity.toDomain());
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    const entities = await this.repository.find({ where: { roleId } });
    return entities.map((entity) => entity.toDomain());
  }

  async save(userRole: UserRole): Promise<UserRole> {
    const entity = UserRoleEntity.fromDomain(userRole);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async delete(userId: string, roleId: string): Promise<void> {
    await this.repository.delete({ userId, roleId });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}

