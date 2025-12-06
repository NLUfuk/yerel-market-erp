import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITenantRepository } from '../../../../domain/tenants/repositories/tenant.repository';
import { Tenant } from '../../../../domain/tenants/entities/tenant.entity';
import { TenantEntity } from '../entities/tenant.typeorm-entity';

/**
 * Tenant Repository Implementation (TypeORM)
 */
@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repository: Repository<TenantEntity>,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByName(name: string): Promise<Tenant | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? entity.toDomain() : null;
  }

  async findAll(): Promise<Tenant[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => entity.toDomain());
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const entity = TenantEntity.fromDomain(tenant);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async update(tenant: Tenant): Promise<Tenant> {
    return this.save(tenant);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

