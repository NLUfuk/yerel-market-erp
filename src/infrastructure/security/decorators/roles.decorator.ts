import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 * Use @Roles('TenantAdmin', 'Cashier') to protect routes
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

