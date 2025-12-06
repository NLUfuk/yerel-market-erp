import { Tenant } from '../entities/tenant.entity';

/**
 * Tenant Repository Interface (Port)
 * Domain layer defines the contract, infrastructure implements it
 */
export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByName(name: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  save(tenant: Tenant): Promise<Tenant>;
  update(tenant: Tenant): Promise<Tenant>;
  delete(id: string): Promise<void>;
}

