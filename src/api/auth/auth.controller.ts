import { Controller, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/auth/use-cases/login.usecase';
import { RegisterTenantUseCase } from '../../application/auth/use-cases/register-tenant.usecase';
import { ImpersonateUserUseCase } from '../../application/auth/use-cases/impersonate-user.usecase';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { RegisterTenantDto } from '../../application/auth/dto/register-tenant.dto';
import { AuthResponseDto } from '../../application/auth/dto/auth-response.dto';
import { Public } from '../../infrastructure/security/decorators/public.decorator';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerTenantUseCase: RegisterTenantUseCase,
    private readonly impersonateUserUseCase: ImpersonateUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(loginDto);
  }

  @Public()
  @Post('register-tenant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new tenant (market) and admin user' })
  @ApiResponse({
    status: 201,
    description: 'Tenant and admin user created successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Tenant or user already exists' })
  async registerTenant(
    @Body() registerDto: RegisterTenantDto,
  ): Promise<AuthResponseDto> {
    return this.registerTenantUseCase.execute(registerDto);
  }

  @Post('impersonate/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('SuperAdmin')
  @ApiOperation({ summary: 'Impersonate a user (SuperAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Impersonation successful, returns new JWT token',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Only SuperAdmin can impersonate users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Cannot impersonate inactive user' })
  async impersonate(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<AuthResponseDto> {
    return this.impersonateUserUseCase.execute(userId, currentUser);
  }
}

