import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateTenantDto } from '../../application/tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../application/tenants/dto/update-tenant.dto';
import { TenantResponseDto } from '../../application/tenants/dto/tenant-response.dto';
import { PaginationDto } from '../../application/shared/dto/pagination.dto';
import { CreateTenantUseCase } from '../../application/tenants/use-cases/create-tenant.usecase';
import { UpdateTenantUseCase } from '../../application/tenants/use-cases/update-tenant.usecase';
import { ListTenantsUseCase } from '../../application/tenants/use-cases/list-tenants.usecase';
import { GetTenantUseCase } from '../../application/tenants/use-cases/get-tenant.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Tenants Controller
 * Handles tenant management endpoints
 * Only SuperAdmin can access these endpoints
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Tenants')
@Controller('tenants')
@ApiBearerAuth()
@Roles('SuperAdmin')
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant (SuperAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Tenant already exists' })
  async create(
    @Body() createDto: CreateTenantDto,
    @CurrentUser() user: RequestUser,
  ): Promise<TenantResponseDto> {
    return this.createTenantUseCase.execute(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants (SuperAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of tenants',
  })
  async list(@Query() pagination: PaginationDto) {
    return this.listTenantsUseCase.execute(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID (SuperAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant details',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.getTenantUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant (SuperAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Tenant name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.updateTenantUseCase.execute(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant (SuperAdmin only)' })
  @ApiResponse({ status: 204, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async delete(@Param('id') id: string): Promise<void> {
    // TODO: Implement delete tenant use case
    throw new Error('Delete tenant not implemented yet');
  }
}

