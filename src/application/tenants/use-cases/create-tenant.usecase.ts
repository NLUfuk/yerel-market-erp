import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import type { ITenantRepository } from '../../../domain/tenants/repositories/tenant.repository';
import { Tenant } from '../../../domain/tenants/entities/tenant.entity';

/**
 * Create Tenant Use Case
 */
@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(dto: CreateTenantDto): Promise<TenantResponseDto> {
    // Check if tenant name already exists
    const existingTenant = await this.tenantRepository.findByName(dto.name);
    if (existingTenant) {
      throw new ConflictException(`Tenant with name "${dto.name}" already exists`);
    }

    // Create tenant
    const tenantId = uuidv4();
    const tenant = new Tenant(
      tenantId,
      dto.name,
      dto.address,
      dto.phone,
      dto.email,
      true,
      new Date(),
      new Date(),
    );

    const savedTenant = await this.tenantRepository.save(tenant);

    return this.toResponseDto(savedTenant);
  }

  private toResponseDto(tenant: Tenant): TenantResponseDto {
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

