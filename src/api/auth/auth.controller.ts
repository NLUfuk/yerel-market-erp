import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/auth/use-cases/login.usecase';
import { RegisterTenantUseCase } from '../../application/auth/use-cases/register-tenant.usecase';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { RegisterTenantDto } from '../../application/auth/dto/register-tenant.dto';
import { AuthResponseDto } from '../../application/auth/dto/auth-response.dto';
import { Public } from '../../infrastructure/security/decorators/public.decorator';

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
}

