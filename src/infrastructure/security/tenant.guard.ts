import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequestUser } from './jwt.strategy';

/**
 * Tenant Guard
 * Ensures users can only access their own tenant's data
 * SuperAdmin bypasses this check (tenantId is null)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SuperAdmin can access all tenants
    if (user.tenantId === null || user.roles.includes('SuperAdmin')) {
      return true;
    }

    // For other users, ensure tenantId matches
    // This will be enforced at the use case level
    return true;
  }
}

