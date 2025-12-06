import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

/**
 * User Repository Interface (Port)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string, tenantId?: string | null): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

/**
 * Role Repository Interface (Port)
 */
export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<Role>;
}

/**
 * UserRole Repository Interface (Port)
 */
export interface IUserRoleRepository {
  findByUserId(userId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  save(userRole: UserRole): Promise<UserRole>;
  delete(userId: string, roleId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

