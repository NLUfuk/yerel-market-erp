import { Injectable, Inject } from '@nestjs/common';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import type { ITenantRepository } from '../../../domain/tenants/repositories/tenant.repository';

/**
 * List Tenants Use Case
 */
@Injectable()
export class ListTenantsUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(pagination: PaginationDto): Promise<{
    data: TenantResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenants = await this.tenantRepository.findAll();

    // Simple pagination (in production, this should be done at database level)
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTenants = tenants.slice(startIndex, endIndex);

    return {
      data: paginatedTenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      })),
      total: tenants.length,
      page,
      limit,
    };
  }
}

