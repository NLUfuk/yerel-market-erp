import { Injectable, Inject } from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * List Users Use Case
 * TenantAdmin can list users from their own tenant
 * SuperAdmin can list all users
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    pagination: PaginationDto,
    currentUser: RequestUser,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let users;

    // SuperAdmin can see all users, others only their tenant
    if (currentUser.tenantId === null || currentUser.roles.includes('SuperAdmin')) {
      users = await this.userRepository.findAll();
    } else {
      users = await this.userRepository.findByTenantId(currentUser.tenantId);
    }

    // Simple pagination (in production, this should be done at database level)
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      data: paginatedUsers.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        isActive: user.isActive,
        roles: user.roles.map((role) => role.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total: users.length,
      page,
      limit,
    };
  }
}

