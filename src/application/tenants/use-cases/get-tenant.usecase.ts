import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import type { ITenantRepository } from '../../../domain/tenants/repositories/tenant.repository';

/**
 * Get Tenant Use Case
 */
@Injectable()
export class GetTenantUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return {
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}

