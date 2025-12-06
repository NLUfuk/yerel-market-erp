import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../jwt.strategy';

/**
 * CurrentUser Decorator
 * Use @CurrentUser() to get the authenticated user from request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

