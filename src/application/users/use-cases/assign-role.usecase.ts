import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import type { IRoleRepository } from '../../../domain/users/repositories/user.repository';
import type { IUserRoleRepository } from '../../../domain/users/repositories/user.repository';
import { UserRole } from '../../../domain/users/entities/user-role.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Assign Role Use Case
 */
@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(
    userId: string,
    dto: AssignRoleDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check tenant access
    if (
      currentUser.tenantId !== null &&
      currentUser.roles.includes('SuperAdmin') === false &&
      user.tenantId !== currentUser.tenantId
    ) {
      throw new ForbiddenException(
        'You can only assign roles to users from your own tenant',
      );
    }

    // Check if role exists
    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${dto.roleId}" not found`);
    }

    // Check if user already has this role
    const existingUserRoles = await this.userRoleRepository.findByUserId(userId);
    const hasRole = existingUserRoles.some((ur) => ur.roleId === dto.roleId);
    if (hasRole) {
      throw new ConflictException('User already has this role');
    }

    // Assign role
    const userRole = new UserRole(userId, dto.roleId, new Date(), currentUser.userId);
    await this.userRoleRepository.save(userRole);

    // Reload user with roles
    const userWithRoles = await this.userRepository.findById(userId);
    if (!userWithRoles) {
      throw new Error('Failed to load user after role assignment');
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

