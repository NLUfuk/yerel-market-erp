import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Get User Use Case
 * TenantAdmin can get users from their own tenant
 * SuperAdmin can get any user
 */
@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, currentUser: RequestUser): Promise<UserResponseDto> {
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
        'You can only access users from your own tenant',
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      isActive: user.isActive,
      roles: user.roles.map((role) => role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
