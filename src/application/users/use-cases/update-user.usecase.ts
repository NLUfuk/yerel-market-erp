import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Update User Use Case
 * TenantAdmin can update users from their own tenant
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateUserDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Check tenant access (SuperAdmin can access all, others only their tenant)
    if (
      currentUser.tenantId !== null &&
      currentUser.roles.includes('SuperAdmin') === false &&
      user.tenantId !== currentUser.tenantId
    ) {
      throw new ForbiddenException(
        'You can only update users from your own tenant',
      );
    }

    // Check if email is being changed and if new email already exists
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        dto.email,
        user.tenantId,
      );
      if (existingUser) {
        throw new ConflictException(
          `User with email "${dto.email}" already exists`,
        );
      }
      user.updateEmail(dto.email);
    }

    // Update name
    if (dto.firstName || dto.lastName) {
      user.updateName(
        dto.firstName || user.firstName,
        dto.lastName || user.lastName,
      );
    }

    // Update password
    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      user.updatePassword(passwordHash);
    }

    // Update active status
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        user.activate();
      } else {
        user.deactivate();
      }
    }

    const updatedUser = await this.userRepository.update(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      tenantId: updatedUser.tenantId,
      isActive: updatedUser.isActive,
      roles: updatedUser.roles.map((role) => role.name),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

