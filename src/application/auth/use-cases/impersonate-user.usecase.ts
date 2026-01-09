import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from '../dto/auth-response.dto';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import { getAuthConfig } from '../../../infrastructure/config/auth.config';
import { JwtPayload, RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Impersonate User Use Case
 * Allows SuperAdmin to impersonate any user by generating a JWT token with the target user's identity
 */
@Injectable()
export class ImpersonateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    targetUserId: string,
    currentUser: RequestUser,
  ): Promise<AuthResponseDto> {
    // Only SuperAdmin can impersonate
    if (!currentUser.roles.includes('SuperAdmin')) {
      throw new ForbiddenException(
        'Only SuperAdmin can impersonate users',
      );
    }

    // Prevent self-impersonation (optional, but good practice)
    if (currentUser.userId === targetUserId) {
      throw new ForbiddenException('Cannot impersonate yourself');
    }

    // Find target user
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${targetUserId}" not found`);
    }

    // Check if target user is active
    if (!targetUser.isActive) {
      throw new UnauthorizedException(
        'Cannot impersonate inactive user',
      );
    }

    // Generate JWT token with target user's identity
    const payload: JwtPayload = {
      sub: targetUser.id,
      email: targetUser.email,
      tenantId: targetUser.tenantId,
      roles: targetUser.roles.map((role) => role.name),
      // Store original user ID for audit purposes (optional)
      // originalUserId: currentUser.userId,
    };

    const config = getAuthConfig();
    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: config.jwtExpiresIn,
    } as any);

    return {
      accessToken,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        tenantId: targetUser.tenantId,
        roles: targetUser.roles.map((role) => role.name),
      },
    };
  }
}
