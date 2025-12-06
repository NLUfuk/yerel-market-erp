import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import type { ITenantRepository } from '../../../domain/tenants/repositories/tenant.repository';

/**
 * Update Tenant Use Case
 */
@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(id: string, dto: UpdateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    // Check if name is being changed and if new name already exists
    if (dto.name && dto.name !== tenant.name) {
      const existingTenant = await this.tenantRepository.findByName(dto.name);
      if (existingTenant) {
        throw new ConflictException(`Tenant with name "${dto.name}" already exists`);
      }
      tenant.updateName(dto.name);
    }

    // Update contact info
    if (dto.address !== undefined || dto.phone !== undefined || dto.email !== undefined) {
      tenant.updateContactInfo(dto.address, dto.phone, dto.email);
    }

    // Update active status
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        tenant.activate();
      } else {
        tenant.deactivate();
      }
    }

    const updatedTenant = await this.tenantRepository.update(tenant);

    return {
      id: updatedTenant.id,
      name: updatedTenant.name,
      address: updatedTenant.address,
      phone: updatedTenant.phone,
      email: updatedTenant.email,
      isActive: updatedTenant.isActive,
      createdAt: updatedTenant.createdAt,
      updatedAt: updatedTenant.updatedAt,
    };
  }
}

