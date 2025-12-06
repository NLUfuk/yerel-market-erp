import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import type { IRoleRepository } from '../../../domain/users/repositories/user.repository';
import type { IUserRoleRepository } from '../../../domain/users/repositories/user.repository';
import { User } from '../../../domain/users/entities/user.entity';
import { UserRole } from '../../../domain/users/entities/user-role.entity';
import { Role } from '../../../domain/users/entities/role.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Create User Use Case
 * TenantAdmin can create users for their own tenant
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(
    dto: CreateUserDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto> {
    // Determine tenantId (from current user, null for SuperAdmin)
    const tenantId = currentUser.tenantId;

    // Check if email already exists for this tenant
    const existingUser = await this.userRepository.findByEmail(
      dto.email,
      tenantId,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists`,
      );
    }

    // Validate roles exist
    const roles: Role[] = [];
    for (const roleId of dto.roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID "${roleId}" not found`);
      }
      roles.push(role);
    }

    // Create user
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new User(
      userId,
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      tenantId,
      true,
      new Date(),
      new Date(),
      [],
    );

    const savedUser = await this.userRepository.save(user);

    // Assign roles
    for (const role of roles) {
      const userRole = new UserRole(
        savedUser.id,
        role.id,
        new Date(),
        currentUser.userId,
      );
      await this.userRoleRepository.save(userRole);
    }

    // Reload user with roles
    const userWithRoles = await this.userRepository.findById(savedUser.id);
    if (!userWithRoles) {
      throw new Error('Failed to load user after creation');
    }

    return {
      id: userWithRoles.id,
      email: userWithRoles.email,
      firstName: userWithRoles.firstName,
      lastName: userWithRoles.lastName,
      tenantId: userWithRoles.tenantId,
      isActive: userWithRoles.isActive,
      roles: userWithRoles.roles.map((role) => role.name),
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
    };
  }
}

