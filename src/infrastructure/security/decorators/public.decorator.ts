import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * Use @Public() to mark routes that don't require authentication
 */
export const Public = () => SetMetadata('isPublic', true);

