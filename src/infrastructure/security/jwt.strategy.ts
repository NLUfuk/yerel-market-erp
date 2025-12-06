import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getAuthConfig } from '../config/auth.config';

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  tenantId: string | null;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * Request User Interface (attached to request object)
 */
export interface RequestUser {
  userId: string;
  email: string;
  tenantId: string | null;
  roles: string[];
}

/**
 * JWT Strategy
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const config = getAuthConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  /**
   * Validate JWT payload and return user object
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId || null,
      roles: payload.roles || [],
    };
  }
}

